const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId },
  questionText: { type: String },
  options: [String],
  correctAnswer: { type: String, required: true },
});

const QuizSchema = new mongoose.Schema({
  grade: { type: Number, required: true },
  subject: { type: String, required: true },
  totalQuestions: { type: Number, required: true },
  maxScore: { type: Number, required: true },
  difficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD'], required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  questions: [QuestionSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quiz', QuizSchema);
