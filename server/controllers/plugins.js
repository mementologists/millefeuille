const Promise = require('bluebird');

const axios = require('axios');

/* eslint-disable import/no-dynamic-require */ /* eslint-disable global-require */
const service = process.env.PROCESS_SERVER;
const plugin = require(`../plugins/${service}`) || {};
/* eslint-enable import/no-dynamic-require */ /* eslint-enable global-require */

const utils = require('../lib/processUtils');

const config = require('config').servers.services;

plugin.name = `Millefeuille ${service} server` ||
  'Generic Process Server';

/* eslint-disable arrow-body-style */
plugin.handleGet = plugin.handleGet || ((req, res) => {
  res.status(200).send(`Hello From ${plugin.name}!: ${JSON.stringify(req.body)}`);
});

const fetchData = plugin.fetchData || ((req) => {
  return axios.get(req.body.moment.media[service].uri, req.body.moment.media[service].s3Cred)
  .then((res) => {
    const newMoment = utils.clone(req.body.moment);
    newMoment.media = {};
    newMoment.media[service] = res.data;
    return newMoment;
  });
});

const processData = plugin.processData || ((moment) => {
  return Promise.resolve(moment);
});

const saveResults = plugin.saveResults || ((moment) => {
  const analysisPort = config.analysis.port ? `:${config.analysis.port}` : '';
  const analysisEndpoint = `${config.analysis.uri}${analysisPort}/api/process`;

  return axios.post(analysisEndpoint, { moment }).data;
});

plugin.handlePost = plugin.handlePost || ((req, res) => {
  res.status(201).send({ data: `Posted to ${plugin.name}!` });
  fetchData(req)
  .then(processData)
  .then(saveResults)
  .catch((err) => {
    console.log(`${plugin.name} caught the following error: ${err}`); // eslint-disable-line
    res.status(500).send(err);
  });
});

module.exports = plugin;
