const app = require('./app');

// const db = require('../db');

const PORT = process.env.port || 3000;

app.listen(PORT, () => {
  /* eslint-disable no-console */
  console.log('millefeuille server listening on port 3000!');
  /* eslint-enable no-console */
});
