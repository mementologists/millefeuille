const mongoose = require('mongoose');

const schemas = require('./schemas');

module.exports =
  Object.keys(schemas).reduce((models, schemaName) => {
    /* eslint-disable no-param-reassign */
    models[schemaName] =
      mongoose.model(schemaName, mongoose.Schema(schemas[schemaName],
        { timestamps: true }));
    return models;
    /* eslint-enable no-param-reassign */
  }, {});

