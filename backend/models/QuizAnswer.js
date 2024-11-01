const mongoose = require('mongoose');

const ResponseSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  userResponse: { type: String, required: true },
  isCorrect: { type: Boolean, required: true }
});

const QuizAnswerSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  responses: [ResponseSchema],
  score: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('QuizAnswer', QuizAnswerSchema);
