const Quiz = require('../models/Quiz');
const QuizAnswer = require('../models/QuizAnswer');
const mongoose = require('mongoose');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const Groq = require('groq-sdk');
const redisClient = require('../config/redis');
const generateImprovementSuggestions = require('../utils/generateImprovementSuggestions');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Function to generate questions using Groq AI.
 */
async function generateQuestionsAI(grade, subject, totalQuestions, difficulty) {
    const prompt = `Generate ${totalQuestions} with ${difficulty} level ${subject} questions for grade ${grade}. Each question should have 4 options (A, B, C, D) and one correct answer (indicate which option is correct)
    questions must start from question number like this-
    
    1. question
    2. question.`;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama3-8b-8192",
        });

        const questionsText = chatCompletion.choices[0]?.message?.content || "";
        console.log("Raw questions text:", questionsText);
        const lines = questionsText.split("\n");
        const questions = [];
        let currentQuestion = null;

        lines.forEach((line) => {
            line = line.trim(); // Trim whitespace from the line
            
            // Check if this line starts a new question
            if (line.match(/^\d+\.\s/)) {
                if (currentQuestion) {
                    questions.push(currentQuestion); // Push the previous question if exists
                }
                // Initialize a new question object
                currentQuestion = {
                    questionId: new mongoose.Types.ObjectId(),
                    questionText: line, // Directly assign the question text
                    options: [],
                    correctAnswer: "",
                };
            } else if (line.startsWith("Options:")) {
                // Skip the "Options:" line itself
            } else if (line.match(/^[A-D]\)/) && currentQuestion) {
                // Match options starting with A), B), C), D)
                currentQuestion.options.push(line); // Add options to the current question
            } else if (line.startsWith("Correct answer:") && currentQuestion) {
                // Extract the correct answer
                currentQuestion.correctAnswer = line.replace(/^Correct answer: /, "").trim();
            }
        });

        // Push the last question if exists
        if (currentQuestion) {
            questions.push(currentQuestion);
        }

        console.log("Extracted questions:", questions);
        return questions.filter(
            (q) => q.questionText && q.options.length === 4 && q.correctAnswer
        );
    } catch (error) {
        console.error("Error generating questions from Groq:", error.message);
        throw new Error("Failed to generate questions");
    }
}

/**
 * Function to create a quiz with AI-generated questions.
 */
exports.createQuiz = async (req, res) => {
    const { grade, Subject, TotalQuestions, MaxScore, Difficulty } = req.body;

    try {
        const questions = await generateQuestionsAI(grade, Subject, TotalQuestions, Difficulty);
        const formattedQuestions = questions.map(q => ({
            questionId: new mongoose.Types.ObjectId(),
            questionText: q.questionText,
            options: q.options,
            correctAnswer: q.correctAnswer
        }));

        const quiz = new Quiz({
            grade,
            subject: Subject,
            totalQuestions: TotalQuestions,
            maxScore: MaxScore,
            difficulty: Difficulty,
            studentId: req.user.userId,
            questions: formattedQuestions
        });

        await quiz.save();
        res.status(201).json({
            quizId: quiz._id,
            questions: quiz.questions.map(q => ({
                questionId: q.questionId,
                questionText: q.questionText,
                options: q.options
            }))
        });
    } catch (error) {
        console.error('Error creating quiz:', error.message);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Function to submit a quiz and calculate the score.
*/
exports.submitQuiz = async (req, res) => {
  const { quizId, responses } = req.body;
  if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ message: 'Invalid quiz ID format' });
  }

  try {
      const quiz = await Quiz.findById(quizId);
      if (!quiz) {
          return res.status(404).json({ message: 'Quiz not found' });
      }

      let score = 0;
      const evaluatedResponses = responses.map(response => {
          const questionId = new mongoose.Types.ObjectId(response.questionId);
          const question = quiz.questions.find(q => q.questionId.toString() === questionId.toString());

          if (!question) {
              console.error(`Question with ID ${response.questionId} not found in quiz ${quizId}`);
              return { questionId: response.questionId, userResponse: response.userResponse, isCorrect: null };
          }

          const isCorrect = question.correctAnswer.trim() === response.userResponse.trim();
          if (isCorrect) score += 1;

          return { questionId: response.questionId, userResponse: response.userResponse, isCorrect };
      }).filter(res => res.isCorrect !== null);

      let quizAnswer = await QuizAnswer.findOne({ quizId, studentId: req.user.userId });

      if (quizAnswer) {
          quizAnswer.responses = evaluatedResponses;
          quizAnswer.score = score;
          await quizAnswer.save();
          console.log('Quiz answer updated successfully.');
      } else {
          quizAnswer = new QuizAnswer({
              quizId,
              studentId: req.user.userId,
              responses: evaluatedResponses,
              score
          });
          await quizAnswer.save();
          console.log('Quiz answer saved:', quizAnswer);
      }

      const suggestions = await generateImprovementSuggestions(evaluatedResponses);

      const user = await User.findById(req.user.userId);
      const message = `
          Hi ${user.username},
          \n\nYou completed the quiz with a score of ${score} out of ${quiz.maxScore}.
          \nHere are some suggestions to improve your skills:
          \n- ${suggestions.join('\n- ')}
          \nKeep practicing!
      `;
      console.log('user email',user);
      
      await sendEmail(user.email, 'Quiz Results', message);

      res.json({ score, maxScore: quiz.maxScore, suggestions });
  } catch (error) {
      console.error('Error submitting quiz:', error.message);
      res.status(500).json({ message: error.message });
  }
};

/**
 * Function to retrieve quiz history with Redis caching.
 */
exports.getQuizHistory = async (req, res) => {
    const { from, to, grade, subject } = req.query;

    try {
       
        let quizFilters = {};

       
        if (subject) {
            quizFilters.subject = { $regex: new RegExp(subject, 'i') }; // Case-insensitive match
        }

       
        if (grade) {
            quizFilters.grade = grade.toString();
        }

        const matchingQuizzes = await Quiz.find(quizFilters).select('_id'); // Fetch only quiz IDs

        
        if (matchingQuizzes.length === 0) {
            return res.status(404).json({ message: `No quizzes found for the subject: ${subject}` });
        }

        const quizIds = matchingQuizzes.map(q => q._id);

       
        const filters = { studentId: req.user.userId, quizId: { $in: quizIds } };

        if (from || to) {
            filters.createdAt = {};
            if (from) {
                const fromDate = new Date(from);
                filters.createdAt.$gte = fromDate;
            }
            if (to) {
                const toDate = new Date(to);
                filters.createdAt.$lte = toDate;
            }
        }

        // Step 4: Fetch the quiz answers that match the filters
        const quizzes = await QuizAnswer.find(filters)
            .populate('quizId', 'grade subject') // Populate quiz details
            .populate('studentId', 'username');  // Populate student details

        // If no quiz answers are found, return an error
        if (!quizzes || quizzes.length === 0) {
            return res.status(404).json({ message: 'No quiz answers found for the given filters' });
        }

        // Step 5: Return the filtered quiz data
        res.json(quizzes);
    } catch (error) {
        console.error('Error fetching quiz history:', error.message);
        res.status(500).json({ message: error.message });
    }
};




exports.getQuizById = async (req, res) => {
  try {
    const quizId = req.params.quizId;
    // const objectId =new mongoose.Types.ObjectId(quizId);
    // console.log("Received quizId:", objectId);  

    // Optional: Validate if the quizId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ message: "Invalid Quiz ID" });
    }

    const quiz = await Quiz.findById(quizId); // Fetch quiz by ID

    if (!quiz) {
      console.log("No Quiz found with this ID");
      return res.status(404).json({ message: 'Quiz not found' });
    }

    console.log("Quiz found:", quiz); // Log if quiz is found
    res.json(quiz);
  } catch (error) {
    console.error("Error fetching quiz:", error); // Log any errors
    res.status(500).json({ message: 'Server Error' });
  }
};



/**
 * Function to get hint of a question.
 */
exports.getHint = async (req, res) => {
  const { question } = req.body;

  if (!question) {
      return res.status(400).json({ message: 'Question is required' });
  }

  try {
      const prompt = `Provide a hint for the following question: "${question}"`;
      const chatCompletion = await groq.chat.completions.create({
          messages: [
              {
                  role: 'user',
                  content: prompt,
              },
          ],
          model: 'llama3-8b-8192',
      });

      const hint = chatCompletion.choices[0]?.message?.content || 'No hint available.';
      res.json({ hint });
  } catch (error) {
      console.error('Error generating hint:', error.message);
      res.status(500).json({ message: 'Failed to generate hint' });
  }
};

