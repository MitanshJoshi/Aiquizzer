const express = require('express');
const { createQuiz, submitQuiz, getQuizHistory, getHint, getQuizById } = require('../controllers/quizController');
const authenticate = require('../middleware/authenticate');
const router = express.Router();

router.post('/create', authenticate, createQuiz);
router.post('/submit', authenticate, submitQuiz);
router.get('/history', authenticate, getQuizHistory);
router.get('/getQuiz/:quizId', authenticate, getQuizById);
router.post('/hint', getHint);

module.exports = router;