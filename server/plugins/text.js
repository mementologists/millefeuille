const textAnalysis = require('../lib/toneAsync').text;

const utils = require('../lib/processUtils');

const scrubText = text =>
  text.replace(/[^]+name="file"/, '').replace(/------WebKitFormBoundary[^]*/, '');

module.exports.processData = moment =>
  textAnalysis(scrubText(moment.media.text))
  .then((data) => {
    const newMoment = utils.clone((moment));
    newMoment.media.text = data;
    return newMoment;
  });
