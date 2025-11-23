#!/usr/bin/env node

// indito.js – ez az egyetlen új fájl, amit létre kell hozni

const app = require('./app');        // betölti a teljes app.js-t
const port = normalizePort(process.env.PORT || '6969');
app.set('port', port);

const server = app.listen(port, () => {
  console.log(`Szerver elindult! Az alábbi porttal: ${port}`);
  console.log(`http://localhost:${port}`);
});

server.on('error', onError);
server.on('listening', () => {});

function normalizePort(val) {
  const port = parseInt(val, 10);
  if (isNaN(port)) return val;
  if (port >= 0) return port;
  return false;
}

function onError(error) {
  if (error.syscall !== 'listen') throw error;

  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' admin/sudo jogosultság szükséges!');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' már foglalt! Próbáld másik porton.');
      process.exit(1);
      break;
    default:
      throw error;
  }
}