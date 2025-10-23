const { program } = require('commander');
const http = require('http');
const fs = require('fs').promises;
const { XMLBuilder } = require('fast-xml-parser');
const url = require('url');

program
  .requiredOption('-i, --input <path>', 'Input JSON file path')
  .requiredOption('-h, --host <host>', 'Server host')
  .requiredOption('-p, --port <port>', 'Server port');

program.parse(process.argv);
const options = program.opts();

const builder = new XMLBuilder({ ignoreAttributes: false });

const server = http.createServer(async (req, res) => {
  try {
    const query = url.parse(req.url, true).query;
    const data = JSON.parse(await fs.readFile(options.input, 'utf-8'));

    let filtered = data;

    if (query.min_rainfall) {
      const minRain = parseFloat(query.min_rainfall);
      filtered = filtered.filter(d => d.Rainfall > minRain);
    }

    const result = filtered.map(item => ({
      rainfall: item.Rainfall,
      pressure3pm: item.Pressure3pm,
      ...(query.humidity === 'true' ? { humidity: item.Humidity3pm } : {})
    }));

    const xml = builder.build({ weather_data: { record: result } });

    res.writeHead(200, { 'Content-Type': 'application/xml' });
    res.end(xml);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Server error: ' + err.message);
  }
});

server.listen(options.port, options.host, () => {
  console.log(`Server running at http://${options.host}:${options.port}/`);
});
