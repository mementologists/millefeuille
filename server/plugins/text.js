const textAnalysis = require('../lib/toneAsync').text;

const scrubText = text =>
  text.replace(/[^]+name="file"/, '').replace(/------WebKitFormBoundary[^]*/, '');

module.exports.processData = moment =>
  textAnalysis(scrubText(moment.media.text))
  .then((data) => {
    const newMoment = JSON.parse(JSON.stringify(moment));
    newMoment.media.text = data;
    return newMoment;
  });
