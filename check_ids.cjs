const fs = require('fs');
const html = fs.readFileSync('/home/zerosync/Documents/Tanaya/index.html', 'utf8');
const js = fs.readFileSync('/home/zerosync/Documents/Tanaya/src/main.js', 'utf8');

const idsInJs = [...js.matchAll(/\$\('([^']+)'\)/g)].map(m => m[1]);
const idsInHtml = new Set([...html.matchAll(/id=["']([^"']+)["']/g)].map(m => m[1]));
const idsInJsHtml = new Set([...js.matchAll(/id=["']([^"']+)["']/g)].map(m => m[1]));

const missing = [];
idsInJs.forEach(id => {
  if (!idsInHtml.has(id) && !idsInJsHtml.has(id)) {
    missing.push(id);
  }
});

console.log("Missing IDs referenced by $():", [...new Set(missing)]);
