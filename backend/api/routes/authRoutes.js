var express = require('express');
var passport = require('passport');
var router = express.Router();
var authController = require('../controllers/authController')
const User = require('../../models/user');
const auth = require('../authentication')();

router.post("/login", passport.authenticate("local"), authController.login);
router.post("/register", authController.register);
router.get('/session', auth.authenticate(), authController.session);
router.post("/logout", auth.authenticate(), authController.logout);
router.post("/pass-reset", User.can('admin users'), authController.passwordReset);


module.exports = router;