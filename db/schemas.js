const mongoose = require('mongoose');

module.exports.User = {
  userId: Number,
  summaryId: Number,
  moments: [Number]
};

module.exports.Summary = {
  userId: Number,
  joyCount: Number,
  fearCount: Number,
  angerCount: Number,
  disgustCount: Number,
  sadnessCount: Number
};

module.exports.Moment = {
  userId: Number,
  analyses: [Number]
};

module.exports.Analysis = {
  type: String,
  analysis: mongoose.Schema.Types.Mixed
};
