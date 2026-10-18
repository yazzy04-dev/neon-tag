const http = require('http');
const { WebSocketServer, WebSocket } = require('ws');
const PORT = process.env.PORT || 10000;
const server = http.createServer((req, res) => {
  if (req.url === '/healthz') { res.writeHead(200, {'content-type':'text/plain'}); return res.end('ok'); }
  res.writeHead(200, {'content-type':'text/plain'}); res.end('NEON TAG multiplayer server is running. WebSocket endpoint: /ws');
});
const wss = new WebSocketServer({ server, path: '/ws' });
const clients = new Map(); // socket -> {id,name,room,x,y,a,color}
const rooms = new Map();
function send(ws, data) { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(data)); }
function snapshot(room) { return [...clients.values()].filter(p => p.room === room).map(({id,name,x,y,a,color})=>({id,name,x,y,a,color})); }
function broadcastRoom(room, data) { for (const [ws,p] of clients) if (p.room === room) send(ws,data); }
wss.on('connection', ws => {
  ws.on('message', raw => {
    if (raw.length > 4096) return ws.close(1009, 'message too large');
    let m; try { m = JSON.parse(raw.toString()); } catch { return; }
    if (m.type === 'join') {
      const room = String(m.room || 'NEON09').toUpperCase().replace(/[^A-Z0-9-]/g,'').slice(0,8) || 'NEON09';
      const name = String(m.name || 'DRIVER').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,16) || 'DRIVER';
      const id = Math.random().toString(36).slice(2,10);
      const p = {id,name,room,x:1200+Math.random()*80-40,y:900+Math.random()*80-40,a:-Math.PI/2,color:'#65f7ff'};
      clients.set(ws,p); send(ws,{type:'welcome',id,room,players:snapshot(room)});
      broadcastRoom(room,{type:'players',players:snapshot(room)});
      return;
    }
    const p = clients.get(ws); if (!p) return;
    if (m.type === 'state') {
      for (const k of ['x','y','a']) if (Number.isFinite(m[k])) p[k] = Math.max(-10000, Math.min(10000, m[k]));
      broadcastRoom(p.room,{type:'players',players:snapshot(p.room)});
    } else if (m.type === 'tag' && typeof m.target === 'string') {
      const target = [...clients.entries()].find(([sock,q])=>q.id===m.target && q.room===p.room);
      if (target) { send(target[0],{type:'tagged',by:p.name}); broadcastRoom(p.room,{type:'event',event:'tag',by:p.name,target:target[1].name}); }
    } else if (m.type === 'ping') send(ws,{type:'pong',time:Date.now()});
  });
  ws.on('close',()=>{const p=clients.get(ws);if(!p)return;clients.delete(ws);broadcastRoom(p.room,{type:'players',players:snapshot(p.room)});});
});
setInterval(()=>{for(const ws of wss.clients) if(ws.readyState===WebSocket.OPEN) send(ws,{type:'heartbeat',time:Date.now()});},20000).unref();
server.listen(PORT,'0.0.0.0',()=>console.log(`NEON TAG server listening on ${PORT}`));
