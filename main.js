const { program } = require('commander');
const http = require('http');
const fs = require('fs');

program
  .requiredOption('-i, --input <path>', 'Input JSON file path')
  .requiredOption('-h, --host <host>', 'Server host')
  .requiredOption('-p, --port <port>', 'Server port');

program.parse(process.argv);

const options = program.opts();

// Перевірка наявності файлу
if (!fs.existsSync(options.input)) {
  console.error('Cannot find input file');
  process.exit(1);
}

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Server is running');
});

server.listen(options.port, options.host, () => {
  console.log(`Server running at http://${options.host}:${options.port}/`);
});
