const mongoose = require('mongoose');

const findOrCreate = require('mongoose-findorcreate');

const schemas = require('./schemas');

module.exports =
  Object.keys(schemas).reduce((models, schemaName) => {
    schemas[schemaName].plugin(findOrCreate);
    models[schemaName] = mongoose.model(schemaName, schemas[schemaName]); // eslint-disable-line 
    return models;
  }, {});

