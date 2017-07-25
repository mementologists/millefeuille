const User = require('../../db').User;

module.exports.getUser = userId => User.findOrCreate({ userId });

module.exports.upsertDonut = (moment) => {
  const update = {};
  update[`summary.${moment.sentiment}Count`] = 1;
  return User.findOneAndUpdate({ userId: moment.userId },
    { $inc: update }, { new: true, upsert: true })
  .then((userRecord) => {
    /* eslint-disable no-param-reassign */
    moment.summary = userRecord.summary;
    /* eslint-enable no-param-reassign */
    return moment;
  });
};

