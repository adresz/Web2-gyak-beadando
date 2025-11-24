// routes/auth.js
const express = require('express');
const router = express.Router();

// Import your existing controllers (they stay untouched!)
const RegisterController = require('../controllers/Auth/RegisterController');
const LoginController    = require('../controllers/Auth/LoginController');

// Register routes
router.get('/register',  RegisterController.create);
router.post('/register', RegisterController.store);

// Login routes
router.get('/login',     LoginController.create);
router.post('/login',    LoginController.store);

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

module.exports = router;