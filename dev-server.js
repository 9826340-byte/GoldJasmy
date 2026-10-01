const http=require('http'),fs=require('fs'),path=require('path');
// node dev-server.js -> http://localhost:8731 (local preview + icon renderer save endpoint; not for hosting)
const root=__dirname;
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.webmanifest':'application/manifest+json','.png':'image/png','.svg':'image/svg+xml'};
http.createServer((q,s)=>{
  if(q.method==='POST'&&q.url.startsWith('/save/')){ // dev-only: save a rendered PNG (data URL body)
    const name=q.url.slice(6); if(!/^[a-z0-9-]+\.png$/.test(name)) return s.writeHead(400).end();
    let b='';q.on('data',d=>b+=d);q.on('end',()=>{fs.writeFileSync(path.join(root,name),Buffer.from(b.split(',')[1],'base64'));s.writeHead(200).end('ok');});return;}
  let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';
  const f=path.join(root,path.normalize(p));if(!f.startsWith(path.normalize(root)))return s.writeHead(403).end();
  fs.readFile(f,(e,d)=>{if(e)return s.writeHead(404).end();s.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream','Cache-Control':'no-cache'});s.end(d);});
}).listen(8731,'127.0.0.1',()=>console.log('listening 8731'));
