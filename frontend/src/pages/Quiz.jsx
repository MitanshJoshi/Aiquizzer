import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchQuiz, fetchQuizById, setUserResponse, submitQuiz } from '../store/slices/quizSlice';
import { useLocation } from 'react-router-dom';

const Quiz = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { id } = location.state || {};
  const { quiz, userResponses, status, error, submitted, score } = useSelector((state) => state.quiz);

  
  const [quizParams, setQuizParams] = useState({
    grade: '',
    subject: '',
    totalQuestions: 10,
    maxScore: 10,
    difficulty: '',
  });
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [hints, setHints] = useState({});
  const [selectedHintIndex, setSelectedHintIndex] = useState(null); 

  const startQuiz = () => {
    if (quizParams.grade && quizParams.subject && quizParams.difficulty) {
      dispatch(fetchQuiz(quizParams));
      setQuizStarted(true);
      setCurrentQuestionIndex(0);
      setRetrying(false);
    } else {
      alert("Please fill in all the fields.");
    }
  };

  useEffect(() => {
    if (id) {
      dispatch(fetchQuizById({ quizId: id }));
      setQuizStarted(true);
      setCurrentQuestionIndex(0);
    }
  }, [id, dispatch]);

  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     if (!quiz || !quiz.questions || quiz.questions.length === 0) {
  //       if (id) {
  //         dispatch(fetchQuizById({ quizId: id }));
  //       } else {
  //         dispatch(fetchQuiz(quizParams));
  //       }
  //     } else {
  //       clearInterval(intervalId);
  //     }
  //   }, 5000);
  
  //   return () => clearInterval(intervalId);
  // }, [quiz, dispatch, id, quizParams]);

  const handleChange = (questionId, value) => {
    dispatch(setUserResponse({ questionId, userResponse: value }));
  };

  const handleParamChange = (e) => {
    const { name, value } = e.target;
    setQuizParams((prevParams) => ({
      ...prevParams,
      [name]: value,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz?.questions?.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      const responses = Object.keys(userResponses).map(questionId => ({
        questionId,
        userResponse: userResponses[questionId]
      }));
      dispatch(submitQuiz({ quizId: (quiz.quizId || id), responses }));
    }
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setQuizStarted(true);
    dispatch(setUserResponse({}));
    dispatch(fetchQuizById({ quizId: (id || quiz.quizId) }));
  };

  // Fetch and display a single hint per button click
  const requestHint = async (questionId, hintIndex) => {
    try {
      const response = await fetch('http://localhost:5000/quiz/hint', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: quiz.questions[currentQuestionIndex]?.questionText, hintIndex }),
      });
      const data = await response.json();
      setHints((prevHints) => ({
        ...prevHints,
        [questionId]: {
          ...prevHints[questionId],
          [hintIndex]: data.hint, // Store the hint for the specific index
        },
      }));
      setSelectedHintIndex(hintIndex); // Mark this hint as selected
    } catch (error) {
      console.error('Error fetching hint:', error);
    }
  };

  if (status === 'loading') {
    return <div className="text-center text-lg">Loading quiz...</div>;
  }

  if (status === 'failed') {
    return <div className="text-center text-red-500">Error: {error?.message || 'Unknown error occurred'}</div>;
  }
  
  if (!quizStarted && !id) {
    return (
      <div className="flex justify-center items-center min-h-[89vh] bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full text-center">
          <h2 className="text-2xl font-bold mb-6">Start Your Quiz</h2>
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-lg font-medium">Select Grade</label>
              <input
                type="number"
                name="grade"
                value={quizParams.grade}
                onChange={handleParamChange}
                className="w-full py-2 px-4 border border-gray-300 rounded-lg"
                placeholder="Grade (e.g., 5)"
              />
            </div>
            <div>
              <label className="block mb-2 text-lg font-medium">Select Subject</label>
              <input
                type="text"
                name="subject"
                value={quizParams.subject}
                onChange={handleParamChange}
                className="w-full py-2 px-4 border border-gray-300 rounded-lg"
                placeholder="Subject (e.g., Mathematics)"
              />
            </div>
            <div>
              <label className="block mb-2 text-lg font-medium">Select Difficulty</label>
              <select
                name="difficulty"
                value={quizParams.difficulty}
                onChange={handleParamChange}
                className="w-full py-2 px-4 border border-gray-300 rounded-lg"
              >
                <option value="">Select Difficulty</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>
          <button
            onClick={startQuiz}
            className="mt-6 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return <div className="text-center text-lg">No quiz data available</div>;
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      {!submitted ? (
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full text-center">
          <h2 className="text-2xl font-bold mb-4">{`Question ${currentQuestionIndex + 1} of ${quiz.questions.length}`}</h2>
          <div className="bg-blue-50 p-6 mb-6 rounded-md shadow-md">
            <h4 className="text-lg font-medium mb-4">{currentQuestion?.questionText}</h4>
            <div className="space-y-4">
              {currentQuestion?.options?.map((option, idx) => (
                <button
                  key={idx}
                  className={`block w-full py-2 px-4 bg-blue-500 text-white rounded-lg  ${
                    userResponses[currentQuestion.questionId] === option ? 'bg-green-700' : ''
                  }`}
                  onClick={() => handleChange(currentQuestion.questionId, option)}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="mt-4 space-x-2">
              {/* Show hint buttons */}
              {[...Array(3)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => requestHint(currentQuestion.questionId, index)}
                  className="py-1 px-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                  disabled={hints[currentQuestion.questionId]?.[index]} // Disable button after the hint is shown
                >
                  {`Hint ${index + 1}`}
                </button>
              ))}
            </div>

            {/* Render selected hint */}
            {selectedHintIndex !== null && hints[currentQuestion.questionId]?.[selectedHintIndex] && (
              <p className="mt-2 text-sm text-gray-600">{hints[currentQuestion.questionId][selectedHintIndex]}</p>
            )}
          </div>
          <button
            onClick={handleNext}
            className="mt-4 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            {currentQuestionIndex === quiz.questions.length - 1 ? 'Submit Quiz' : 'Next'}
          </button>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full text-center">
          <h2 className="text-2xl font-bold mb-4">Quiz Submitted!</h2>
          <p className="mb-6">{`Your score: ${score} / ${quiz.questions.length}`}</p>
          <button onClick={handleRetry} className="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
            Retry Quiz
          </button>
        </div>
      )}
    </div>
  );
};

export default Quiz;
