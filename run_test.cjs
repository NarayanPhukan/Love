const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('/home/zerosync/Documents/Tanaya/index.html', 'utf8');

const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.on("error", (error) => {
  console.log("PAGE ERROR:", error.stack || error);
});
virtualConsole.on("jsdomError", (error) => {
  console.log("JSDOM ERROR:", error.stack || error);
});
virtualConsole.on("log", (msg) => {
  console.log("PAGE LOG:", msg);
});

const dom = new JSDOM(html, {
  runScripts: "dangerously",
  resources: "usable",
  url: "file:///home/zerosync/Documents/Tanaya/index.html",
  virtualConsole
});
setTimeout(() => {
  console.log('done');
}, 2000);
