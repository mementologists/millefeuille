const Promise = require('bluebird');
/* eslint-disable import/no-dynamic-require */ /* eslint-disable global-require */
const plugin = require(`../plugins/${process.env.PROCESS_SERVER}`) || {};
/* eslint-enable import/no-dynamic-require */ /* eslint-enable global-require */
// const axios = require('axios');

plugin.name = plugin.name || 'The Generic Process Server';

/* eslint-disable arrow-body-style */
plugin.handleGet = plugin.handleGet || ((req, res) => {
  res.status(200).send(`Hello From ${plugin.name}!: ${JSON.stringify(req.body)}`);
});

const fetchData = plugin.fetchData || ((req) => {
  // return Promise of:
  // Default: Make Call to S3
  // Decorate momentObj with file and return
  return Promise.resolve(req);
});

const processData = plugin.processData || ((data) => {
  // return Promise of:
  // Default: Make API call to PROCESS_SERVER_API_URL
  // Decorate momentObj with results and return
  return Promise.resolve(data);
});

const saveResults = plugin.saveResults || ((data) => {
  // Default: Make API call to ANALYSIS_API_URL
  return Promise.resolve(data);
});

const handleError = plugin.handleError || ((err) => {
  /* eslint-disable no-console */
  console.log(`${plugin.name} caught the following error: ${err}`);
  /* eslint-enable no-console */
});
/* eslint-enable arrow-body-style */

plugin.handlePost = plugin.handlePost || ((req, res) => {
  res.status(201).send({ data: `Posted to ${plugin.name}!` });
  fetchData(req)
  .then(processData)
  .then(saveResults)
  .catch(handleError);
});

module.exports = plugin;
