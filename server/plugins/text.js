const textAnalysis = require('../lib/toneAsync').text;

module.exports.processData = moment =>
  textAnalysis(moment.media.text)
  .then((data) => {
    const newMoment = JSON.parse(JSON.stringify(moment));
    newMoment.media.text = data;
    return newMoment;
  });

