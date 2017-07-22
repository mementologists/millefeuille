

const getMaxIndex = array =>
      array.findIndex(el => el.score === Math.max(...array.map(tone => tone.score)));

module.exports.clone = obj => JSON.parse(JSON.stringify(obj));

module.exports.textSummary = (textAnalysis) => {
  const tones = textAnalysis.document_tone.tone_categories[0].tones;
  return tones[getMaxIndex(tones)].tone_name;
};
