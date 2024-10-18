'use strict';
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../authentication')();
const User = require('../../models/user');

// Get list of reports
router.get('', User.can("view data"), reportController.search_reports);

module.exports = router;
