const Promise = require('bluebird');

const axios = require('axios');

const utils = require('../lib/processUtils');

const config = require('config').servers.services;

const creditQueue = config.video.keys;
const inQueue = [];
const pollList = [];
const analysisPort = config.analysis.port ? `:${config.analysis.port}` : '';
const analysisEndpoint = `${config.analysis.uri}${analysisPort}/api/process`;

const postVideo = ({ moment, key }) =>
  axios.post(config.video.api_uri, { url: moment.media.video.uri }, utils.getCfg(key))
  .then(res => res.headers['operation-location'])
  .then(pollURI => pollList.push({ moment, key, pollURI, loops: 0 }))
  .catch((err) => {
    console.log( // eslint-disable-line no-console
      'postVideo error: ', err.response.status, err.response.statusText);
    if (err.response.status === 429) {
      console.log( // eslint-disable-line no-console
        `Returning moment ${moment.id} and key ${key} for retry`);
      inQueue.unshift(moment);
      creditQueue.unshift(key);
      return; // eslint-disable-line no-useless-return
    }
    throw err;
  });

const postWorker = () =>
  utils.delay(config.video.pollInterval)
  .then(() => {
    console.log( // eslint-disable-line no-console
      `Postworker wakes: ${inQueue.length} vids in Q w/${creditQueue.length} keys`);
    while (inQueue.length && creditQueue.length) {
      console.log( // eslint-disable-line
        `Incoming Video to process: moment ${inQueue[0].id} key: ${creditQueue[0]}`);
      postVideo({ moment: inQueue.shift(), key: creditQueue.shift() });
    }
    console.log('PostWorker going back to sleep '); // eslint-disable-line
    return postWorker();
  })
  .catch((err) => {
    console.log( // eslint-disable-line no-console
      'PostWorker error: ', err);
  });

const postResults = ({ res, moment }) => {
  const newMoment = utils.clone(moment);
  newMoment.media = {};
  const analysis = JSON.parse(res.data.processingResult).fragments[0].events;
  newMoment.media.video = utils.summarizeVideo(analysis);
  console.log( // eslint-disable-line no-console
    'Posting Summarized video moment to Ana: ', JSON.stringify(newMoment));
  return axios.post(analysisEndpoint, { moment: newMoment })
  .catch((err) => {
    console.log( // eslint-disable-line no-console
      'Millefeuille Video Proc. Error when posting result to Analysis Server:', err);
    throw err;
  });
};

const checkVideoStatus = (video) => {
  const { moment, key, pollURI, loops } = video;
  console.log( // eslint-disable-line no-console
    `Checking video status for moment: ${moment.id} using ${key} try #${loops}`);
  return axios.get(pollURI, utils.getCfg(key))
  .then((res) => {
    console.log( // eslint-disable-line no-console
      `Video polling status moment: ${moment.id} key: ${key}: ${res.data.status}`);
    if (res.data.status === 'Succeeded') {
      pollList.splice(pollList.findIndex(vid => vid.key === key), 1);
      creditQueue.push(key);
      return postResults({ res, moment });
    }
    return video.loops++; // eslint-disable-line
  })
  .catch((err) => {
    console.log( // eslint-disable-line no-console
      'checkVideoStatus error: ', err.response.status, err.response.statusText);
    if (err.response.status === 429) {
      console.log('429 Rate error - Retrying'); // eslint-disable-line no-console
      return; // eslint-disable-line no-useless-return
    }
    throw err;
  });
};

const pollWorker = () =>
  utils.delay(config.video.pollInterval)
  .tap(() => {
    console.log( // eslint-disable-line no-console
      `Pollworker wakes: ${pollList.length} videos to process`);
  })
 .then(() => Promise.map(pollList, video => checkVideoStatus(video)))
 .then(() => {
   console.log('PollWorker going back to sleep'); // eslint-disable-line no-console
   return pollWorker();
 })
 .catch((err) => {
   console.log('PollWorker error: ', err); // eslint-disable-line no-console
 });

const enqueueMoment = (req, res) => {
  res.status(201).send({ data: 'Posted to Millefeuille video server!' });
  inQueue.push(req.body.moment);
};

module.exports.handlePost = (req, res) => enqueueMoment(req, res);
postWorker();
pollWorker();

