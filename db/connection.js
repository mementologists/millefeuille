const mongoose = require('mongoose');

const config = require('config');

const mongoUri = process.env.MONGODB_URI || config.servers.mongo.uri;

mongoose.connect(mongoUri);

module.exports.db = mongoose.connection;
