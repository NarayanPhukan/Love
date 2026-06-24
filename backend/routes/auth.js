import express from 'express'
import nodemailer from 'nodemailer'
import User from '../models/User.js'
import protect, { generateToken } from '../middleware/auth.js'
import crypto from 'crypto'

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const router = express.Router()

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, phone } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return res.status(400).json({ message: 'A user with this email already exists' })
    }

    const verificationToken = crypto.randomBytes(32).toString('hex')

    const user = await User.create({
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      isVerified: false,
      verificationToken
    })

    const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`

    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'The Botanical Diary'}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: '🌿 Verify Your Botanical Diary Email',
      html: `
        <div style="font-family: Georgia, serif; max-width: 500px; margin: 0 auto; padding: 32px; background: #f7f3ed; border-radius: 16px;">
          <h1 style="color: #2F4F3E; font-style: italic; text-align: center;">Botanical Diary</h1>
          <p style="color: #5C6B61; line-height: 1.6;">Welcome to your new digital herbarium. Please verify your email to start tending to your memories.</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${verifyUrl}" style="background: #2F4F3E; color: white; padding: 14px 32px; border-radius: 24px; text-decoration: none; font-weight: 600;">Verify Email</a>
          </div>
          <p style="color: #8C6A66; font-size: 0.85rem;">If you didn't create an account, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid rgba(47,79,62,0.1); margin: 24px 0;">
          <p style="color: #8C6A66; font-size: 0.75rem; text-align: center;">© The Botanical Diary — A Living Heirloom</p>
        </div>
      `
    })

    const token = generateToken(user._id)

    res.status(201).json({
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      token,
      isNewUser: true
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const isMatch = await user.matchPassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const token = generateToken(user._id)

    res.json({
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      location: user.location,
      avatarUrl: user.avatarUrl,
      partnerName: user.partnerName,
      relationshipStartDate: user.relationshipStartDate,
      token
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// GET /api/auth/me — get current user
router.get('/me', protect, async (req, res) => {
  res.json({
    _id: req.user._id,
    email: req.user.email,
    fullName: req.user.fullName,
    phone: req.user.phone,
    location: req.user.location,
    avatarUrl: req.user.avatarUrl,
    partnerName: req.user.partnerName,
    relationshipStartDate: req.user.relationshipStartDate
  })
})

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      // Don't reveal if user exists
      return res.json({ message: 'If the email exists, a reset link has been sent.' })
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    user.resetToken = resetToken
    user.resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour
    await user.save()

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`

    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'The Botanical Diary'}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: '🌿 Reset Your Garden Password',
      html: `
        <div style="font-family: Georgia, serif; max-width: 500px; margin: 0 auto; padding: 32px; background: #f7f3ed; border-radius: 16px;">
          <h1 style="color: #2F4F3E; font-style: italic; text-align: center;">Botanical Diary</h1>
          <p style="color: #5C6B61; line-height: 1.6;">Someone requested a password reset for your garden. Click the link below to set a new password:</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${resetUrl}" style="background: #2F4F3E; color: white; padding: 14px 32px; border-radius: 24px; text-decoration: none; font-weight: 600;">Reset Password</a>
          </div>
          <p style="color: #8C6A66; font-size: 0.85rem;">If you didn't request this, please ignore this email. The link expires in 1 hour.</p>
          <hr style="border: none; border-top: 1px solid rgba(47,79,62,0.1); margin: 24px 0;">
          <p style="color: #8C6A66; font-size: 0.75rem; text-align: center;">© The Botanical Diary — A Living Heirloom</p>
        </div>
      `
    })

    res.json({ message: 'If the email exists, a reset link has been sent.' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    })

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' })
    }

    user.password = password
    user.resetToken = undefined
    user.resetTokenExpiry = undefined
    await user.save()

    res.json({ message: 'Password updated successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// POST /api/auth/verify-email
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body
    if (!token) return res.status(400).json({ message: 'No token provided' })

    const user = await User.findOne({ verificationToken: token })
    if (!user) return res.status(400).json({ message: 'Invalid or expired verification link' })

    user.isVerified = true
    user.verificationToken = undefined
    await user.save()

    res.json({ message: 'Email successfully verified' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
