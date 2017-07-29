const mongoose = require('mongoose');

module.exports.User = mongoose.Schema({
  userId: { type: Number, default: 0 },
  summary: {
    joyCount: { type: Number, default: 0 },
    fearCount: { type: Number, default: 0 },
    angerCount: { type: Number, default: 0 },
    disgustCount: { type: Number, default: 0 },
    sadnessCount: { type: Number, default: 0 }
  },
  history: [
    {
      momentId: Number,
      summary:
      { anger: Number, disgust: Number, fear: Number, joy: Number, sadness: Number }
    }
  ]
}, { collection: 'Users', timestamps: true });


module.exports.Sentiment = mongoose.Schema({
  userId: Number,
  momentId: Number,
  key: String,
  average: String,
  analysis: mongoose.Schema.Types.Mixed
}, { collection: 'Sentiments', timestamps: true });
