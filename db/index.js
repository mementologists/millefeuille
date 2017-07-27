const config = require('config');

const Promise = require('bluebird');

const mongoose = require('mongoose');

const mongoUri = process.env.MONGODB_URI ? `mongodb://${process.env.MONGODB_URI}:27017/analysis` : config.servers.mongo.uri;

const options = { promiseLibrary: Promise, useMongoClient: true };

mongoose.connect(mongoUri, options);

mongoose.Promise = Promise;

const models = require('./models');

module.exports = models;
