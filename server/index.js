const app = require('./app');

const config = require('config').servers.services[process.env.PROCESS_SERVER];

const PORT = process.env.port || config.port;

app.listen(PORT, () => {
  /* eslint-disable no-console */
  console.log(`millefeuille ${process.env.PROCESS_SERVER} server listening on port ${PORT}!`);
  /* eslint-enable no-console */
});
