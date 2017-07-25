const config = require('config');

const Promise = require('bluebird');

const mongoose = require('mongoose');

const mongoUri = process.env.MONGODB_URI || config.servers.mongo.uri;

const options = { promiseLibrary: Promise };

mongoose.connect(mongoUri, options);

mongoose.Promise = Promise;

const models = require('./models');

module.exports = models;
