const express = require('express');
const { login, register, getUser } = require('../controllers/authController');
const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/getuser',getUser);


module.exports = router;
