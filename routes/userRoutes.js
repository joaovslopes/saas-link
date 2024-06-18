// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { registerUser, addDomain } = require('../controllers/userController');


router.post('/register', registerUser);


router.post('/add-domain', addDomain);

module.exports = router;
