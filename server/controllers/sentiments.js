const Sentiment = require('../../db').Sentiment;

const Promise = require('bluebird');

module.exports.set = moment =>
  Promise.map(Object.keys(moment.media), key =>
    Sentiment.findOneAndUpdate(
      { userId: moment.userId, momentId: moment.id, key },
      { analysis: moment.media[key] },
      { upsert: true })
    );

module.exports.getMomentSentiments = moment =>
  Sentiment.find({ momentId: moment.id, userId: moment.userId });
