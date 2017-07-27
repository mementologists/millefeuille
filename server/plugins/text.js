const analyzeText = require('../lib/toneAsync').text;

const utils = require('../lib/processUtils');

module.exports.processData = moment =>
  analyzeText(moment.media.text)
  .then(data => utils.summarizeText(data))
  .then((data) => {
    const newMoment = utils.clone(moment);
    newMoment.media.text = data;
    return newMoment;
  });
