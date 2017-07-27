
const getMaxIndex = array =>
      array.findIndex(el => el.score === Math.max(...array.map(tone => tone.score)));

module.exports.clone = obj => Object.assign({}, obj);

module.exports.textSummary = (textAnalysis) => {
  const tones = textAnalysis.document_tone.tone_categories[0].tones;
  return tones[getMaxIndex(tones)].tone_id;
};

const normalizeSummary = (aggregate) => {
  Object.keys(aggregate.summary).forEach((emotion) => {
    aggregate.summary[emotion] /= aggregate.total; // eslint-disable-line
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

const getMaxEmotion = summary =>
      Object.keys(summary).sort((a, b) => summary[a] > summary[b])[0];

module.exports.summarize = (sentiments) => 
  getMaxEmotion(
    normalizeSummary(
      sentiments.reduce((sum, sentiment) => {
        Object.keys(sentiment.analysis.summary).forEach(emotion => {
          sum.total += sentiment.analysis.summary[emotion];
          sum.summary[emotion] += sentiment.analysis.summary[emotion];
        });
        return sum;
      }, { total: 0, summary: { anger: 0, disgust: 0, fear: 0, joy: 0, sadness: 0 } })
    ).summary);
