// node tools/dev-server.js -> http://localhost:8731 (local preview only; not deployed)
//   /          the app (site/)
//   /tools/    developer tools (icon and launch-image renderer)
//   POST /save/icons/<name>.png, /save/splash/<name>.png  writes a rendered PNG into site/
const http = require('http'), fs = require('fs'), path = require('path');
const repo = path.join(__dirname, '..');
const site = path.join(repo, 'site'), tools = __dirname;
// apply the same global headers (CSP etc.) as production: the "/*" block of site/_headers
const prodHeaders = {};
(fs.readFileSync(path.join(site, '_headers'), 'utf8').split(/\r?\n\/[^\n]*\n/)[0].split(/\r?\n/).slice(1))
  .forEach(l => { const m = /^\s+([^:]+):\s*(.+)$/.exec(l); if (m) prodHeaders[m[1]] = m[2]; });
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
                '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml' };
http.createServer((q, s) => {
  if (q.method === 'POST' && q.url.startsWith('/save/')) {
    const m = /^\/save\/(icons|splash)\/([a-z0-9@x-]+\.png)$/.exec(q.url);
    if (!m) return s.writeHead(400).end();
    let b = ''; q.on('data', d => b += d);
    q.on('end', () => {
      fs.mkdirSync(path.join(site, m[1]), { recursive: true });
      fs.writeFileSync(path.join(site, m[1], m[2]), Buffer.from(b.split(',')[1], 'base64'));
      s.writeHead(200).end('ok');
    });
    return;
  }
  let p = decodeURIComponent(q.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  let base = site;
  if (p.startsWith('/tools/')) { base = tools; p = p.slice(6); }
  const f = path.join(base, path.normalize(p));
  if (!f.startsWith(base)) return s.writeHead(403).end();
  fs.readFile(f, (e, d) => {
    if (e) return s.writeHead(404).end();
    s.writeHead(200, Object.assign(base === site ? Object.assign({}, prodHeaders) : {},
      { 'Content-Type': types[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-cache' }));
    s.end(d);
  });
}).listen(8731, '127.0.0.1', () => console.log('listening 8731'));
