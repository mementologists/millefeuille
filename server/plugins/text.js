const textAnalysis = require('../lib/toneAsync').text;

const utils = require('../lib/processUtils');

module.exports.processData = moment =>
  textAnalysis(moment.media.text)
  .then((data) => {
    const newMoment = utils.clone((moment));
    newMoment.media.text = data;
    return newMoment;
  });
