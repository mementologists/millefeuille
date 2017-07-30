const Promise = require('bluebird');

const config = require('config').servers.services.video;

const axios = require('axios');

const getMaxIndex = array =>
      array.findIndex(el => el.score === Math.max(...array.map(tone => tone.score)));

module.exports.clone = obj => Object.assign({}, obj);

module.exports.textSummary = (textAnalysis) => {
  const tones = textAnalysis.document_tone.tone_categories[0].tones;
  return tones[getMaxIndex(tones)].tone_id;
};

const normalizeSummary = (aggregate) => {
  Object.keys(aggregate.summary).forEach((emotion) => {
    aggregate.summary[emotion] /= aggregate.total ? aggregate.total : 1; // eslint-disable-line
  });
  delete aggregate.total; // eslint-disable-line
  return aggregate;
};

module.exports.summarizeText = (textAnalysis) => {
  const tones = textAnalysis.document_tone.tone_categories[0].tones;
  const aggregate = { total: 0, summary: {}, raw: [textAnalysis] };
  tones.forEach((tone) => {
    aggregate.summary[tone.tone_id] = tone.score;
    aggregate.total += tone.score;
  });
  return normalizeSummary(aggregate);
};

const mapEmotions = (aggregate) => {
  const eMap = { happiness: 'joy' };
  Object.keys(eMap).forEach((emotion) => {
    aggregate.summary[eMap[emotion]] = aggregate.summary[emotion]; // eslint-disable-line
    delete aggregate.summary[emotion]; // eslint-disable-line
  });
  return aggregate;
};

const scrubEmotions = (aggregate) => {
  const scrubs = ['neutral', 'contempt', 'surprise'];
  scrubs.forEach((emotion) => {
    aggregate.total -= aggregate.summary[emotion]; // eslint-disable-line
    delete aggregate.summary[emotion]; // eslint-disable-line
  });
  return aggregate;
};

module.exports.summarizeImage = imageAnalyses =>
  normalizeSummary(
    mapEmotions(
      scrubEmotions(
        imageAnalyses.reduce((aggregate, analysis) => {
          const weight = analysis.faceRectangle.height * analysis.faceRectangle.width;
          Object.keys(analysis.scores).forEach((emotion) => {
            aggregate.summary[emotion] = // eslint-disable-line
              !aggregate.summary[emotion] ? analysis.scores[emotion] * weight : // eslint-disable-line
              aggregate.summary[emotion] + analysis.scores[emotion] * weight; // eslint-disable-line
            aggregate.total += analysis.scores[emotion] * weight; // eslint-disable-line
          });
          aggregate.raw.push(analysis); // eslint-disable-line
          return aggregate;
        }, { total: 0, summary: {}, raw: [] })
      )));

module.exports.getMaxEmotion = summary =>
  Object.keys(summary).sort((a, b) => summary[b] - summary[a])[0];

module.exports.summarizeVideo = videoAnalyses =>
  normalizeSummary(
    mapEmotions(
      scrubEmotions(
        videoAnalyses.reduce((aggregate, analysis) => {
          if (analysis.length) {
            const scores = analysis[0].windowMeanScores;
            Object.keys(scores).forEach((emotion) => {
              aggregate.summary[emotion] += scores[emotion]; // eslint-disable-line
              aggregate.total += scores[emotion]; // eslint-disable-line
            });
            aggregate.raw.push(analysis);
          }
          return aggregate;
        },
          { total: 0,
            summary: {
              neutral: 0,
              happiness: 0,
              surprise: 0,
              sadness: 0,
              anger: 0,
              disgust: 0,
              fear: 0,
              contempt: 0
            },
            raw: [] }
    ))
  ));

module.exports.summarize = sentiments =>
    normalizeSummary(
      sentiments.reduce((sum, sentiment) => {
        Object.keys(sentiment.analysis.summary).forEach((emotion) => {
          sum.total += sentiment.analysis.summary[emotion]; // eslint-disable-line
          sum.summary[emotion] += sentiment.analysis.summary[emotion]; // eslint-disable-line
        });
        return sum;
      }, { total: 0, summary: { anger: 0, disgust: 0, fear: 0, joy: 0, sadness: 0 } })
    ).summary;

module.exports.delay = t =>
  new Promise(resolve => setTimeout(resolve, t));

module.exports.saveResults = ((moment) => {
  const analysisPort = config.analysis.port ? `:${config.analysis.port}` : '';
  const analysisEndpoint = `${config.analysis.uri}${analysisPort}/api/process`;

  return axios.post(analysisEndpoint, { moment }).data;
});
