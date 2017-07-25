
const getMaxIndex = array =>
      array.findIndex(el => el.score === Math.max(...array.map(tone => tone.score)));

module.exports.clone = obj => Object.assign({}, obj);

module.exports.textSummary = (textAnalysis) => {
  const tones = textAnalysis.document_tone.tone_categories[0].tones;
  return tones[getMaxIndex(tones)].tone_id;
};

module.exports.audioSummary = module.exports.textSummary;

module.exports.imageSummary = imageAnalysis => imageAnalysis;
  // iterate over each face
  // sum each likelihood (1/6) weighted by
  //    detectionConfidence, blurred, underExposed, headwear
  // divide the total likelihood by the number of faces

module.exports.summarize = (sentiments) => {
  let sumTones = [];
  const maxTone = Math.max(...(sumTones = sentiments.reduce((totals, sentiment) => {
    /* eslint-disable no-return-assign */
    sentiment.analysis.document_tone.tone_categories[0].tones.forEach((tone, idx) =>
      /* eslint-disable no-param-reassign */ /* eslint-enable no-return-assign */
      totals[idx] = totals[idx] ? totals[idx] + tone.score : tone.score);
      /* eslint-enable no-param-reassign */
    return totals;
  }, [])));
  return ['anger', 'disgust', 'fear', 'joy', 'sadness'][sumTones.findIndex(el => el === maxTone)];
};
