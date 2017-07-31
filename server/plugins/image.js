const Promise = require('bluebird');

const axios = require('axios');

const utils = require('../lib/processUtils');

const config = require('config').servers.services.image;

const vizParams = {
  visualFeatures: 'Categories,Tags,Faces,ImageType,Description,Color,Adult',
  details: 'Celebrities,Landmarks',
  language: 'en'
};

module.exports.fetchData = req => Promise.resolve(req.body.moment);

module.exports.processData = moment =>
  Promise.all(
    [
      axios.post(config.api_uri,
        { url: moment.media.image.uri }, utils.getCfg(config.key)),
      axios.post(utils.getParamURI(config.vision.api_uri, vizParams),
        { url: moment.media.image.uri }, utils.getCfg(config.vision.key))
    ])
  .then(([emoRes, vizRes]) => {
    const aggregate = utils.summarizeImage(emoRes.data);
    aggregate.description = vizRes.data;
    return aggregate;
  })
  .then((aggregate) => {
    const newMoment = utils.clone(moment);
    newMoment.media = {};
    newMoment.media.image = aggregate;
    return newMoment;
  })
  .catch((err) => {
    console.log('Image ProcessData Error: ', err); // eslint-disable-line no-console
  });

