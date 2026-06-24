const fs = require('fs');
const js = fs.readFileSync('/home/zerosync/Documents/Tanaya/src/main.js', 'utf8');

const match = js.match(/document\.querySelector\('#app'\)\.innerHTML\s*=\s*`([\s\S]+?)`/);
if (match) {
  const html = match[1];
  const { JSDOM } = require("jsdom");
  const dom = new JSDOM(html);
  
  const inviteView = dom.window.document.getElementById('invite-view');
  if (inviteView) {
    console.log("invite-view children:", Array.from(inviteView.children).map(c => c.id || c.className));
  }
}
