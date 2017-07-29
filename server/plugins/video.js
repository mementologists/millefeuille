const Promise = require('bluebird');

const axios = require('axios');

const utils = require('../lib/processUtils');

const config = require('config').servers.services.video;

class AxiosCfg {
  constructor() {
    this.keyIndex = Math.floor(Math.random() * config.keys.length);
  }
  getCfg() {
    this.keyIndex = (this.keyIndex + 1) % config.keys.length;
    return {
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': config.keys[this.keyIndex]
      }
    };
  }
}

const inQueue = [];
// const processingQueue = [];
const axiosCfg = new AxiosCfg();

const waitUntilProcessed = (uri, cfg, loopCnt = 0, maxLoops = 250, t = 30000) =>
  utils.delay(t)
  .then(() => axios.get(uri, cfg))
  .then((res) => {
    if ((res.data.status === 'Running') && (loopCnt < maxLoops)) {
      return waitUntilProcessed(uri, cfg, loopCnt + 1, maxLoops, t);
    }
    return Promise.resolve(res.data);
  })
  .catch((err) => {
    console.log('Millefeuille Video Processor Got ERR waiting for Video to be processed: ', err); // eslint-disable-line
    throw (err);
  });

const processData = (moment) => {
  const cfg = axiosCfg.getCfg();
  return axios.post(config.api_uri, { url: moment.media.video.uri }, cfg)
  .then(res => res.headers['operation-location'])
  .then(answerPollURI => waitUntilProcessed(answerPollURI, cfg))
  .then(data => utils.summarizeVideo(data.processingResult.fragments.events))
  .then((summary) => {
    const newMoment = utils.clone(moment);
    newMoment.media = {};
    newMoment.media.video = summary;
    return newMoment;
  });
};

const fetchData = (req, res) => {
  res.status(201).send({ data: 'Posted to Millefeuille video server!' });
  inQueue.push(req.body.moment);
};

const saveResults = ((moment) => {
  const analysisPort = config.analysis.port ? `:${config.analysis.port}` : '';
  const analysisEndpoint = `${config.analysis.uri}${analysisPort}/api/process`;

  return axios.post(analysisEndpoint, { moment }).data;
});

const postWorker = () =>
  (utils.delay(config.pollInterval)
  .then(() => {
    if (inQueue.length) {
      console.log('hey! there is video to be processed: ', inQueue[0]); // eslint-disable-line
      return processData(inQueue.shift());
    }
    console.log('hey! Nothing to do. Going back to sleep '); // eslint-disable-line
    throw (null); // eslint-disable-line
  })
  .then(moment => saveResults(moment))
  .then(() => { throw (null); }) // eslint-disable-line
  .catch(() => postWorker()));

module.exports.handlePost = (req, res) => fetchData(req, res);

postWorker();
