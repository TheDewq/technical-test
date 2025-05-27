import http from 'http';

const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Servidor simple funcionando');
});

server.listen(3000, '0.0.0.0', () => {
  console.log('Servidor simple escuchando en 3000');
});
