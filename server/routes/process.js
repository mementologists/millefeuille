const router = require('express').Router();
const pluginController = require('../controllers').Plugins;

router.route('/')
  .post(pluginController.handlePost);

router.route('/:id')
  .get(pluginController.handleGet);

module.exports = router;
