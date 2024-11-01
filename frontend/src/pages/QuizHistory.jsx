// QuizHistory.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchQuizHistory, fetchQuiz } from '../store/slices/quizSlice';
import { useNavigate } from 'react-router-dom';

const QuizHistory = () => {
  const dispatch = useDispatch();
  const quizHistory = useSelector((state) => state.quiz.quizHistory);
  const status = useSelector((state) => state.quiz.status);
  const error = useSelector((state) => state.quiz.error);
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    from: '',
    to: '',
    grade: '',
    subject: '',
  });

  useEffect(() => {
    dispatch(fetchQuizHistory(filters));
  }, [filters, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simple date validation to ensure 'from' is not later than 'to'
    if (filters.from && filters.to && new Date(filters.from) > new Date(filters.to)) {
      alert("The 'from' date cannot be later than the 'to' date.");
      return;
    }

    dispatch(fetchQuizHistory(filters));
  };
  const handleReattempt = (quiz) => {
    navigate('/quiz',{state:{id:quiz.quizId._id}})
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Quiz History</h2>
        
       
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <input
            type="date"
            name="from"
            value={filters.from}
            onChange={handleChange}
            className="border border-gray-300 p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="date"
            name="to"
            value={filters.to}
            onChange={handleChange}
            className="border border-gray-300 p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="text"
            name="grade"
            placeholder="Grade"
            value={filters.grade}
            onChange={handleChange}
            className="border border-gray-300 p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="text"
            name="subject"
            placeholder="Subject"
            value={filters.subject}
            onChange={handleChange}
            className="border border-gray-300 p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="col-span-1 sm:col-span-2 md:col-span-4 bg-blue-500 text-white font-semibold p-3 rounded-lg shadow hover:bg-blue-600 transition">
            Apply Filters
          </button>
        </form>

       
        {status === 'loading' && <p className="text-center text-blue-500">Loading...</p>}
        {quizHistory.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quizHistory.map((quiz) => (
              <div key={quiz._id} className="bg-white border border-gray-200 rounded-lg shadow p-4 hover:shadow-lg transition">
                <p className="text-gray-700 font-semibold">Grade: <span className="font-normal">{quiz.quizId.grade}</span></p>
                <p className="text-gray-700 font-semibold">Subject: <span className="font-normal">{quiz.quizId.subject}</span></p>
                <p className="text-gray-700 font-semibold">Submitted By: <span className="font-normal">{quiz.studentId.username}</span></p>
                <p className="text-gray-700 font-semibold">Score: <span className="font-normal">{quiz.score}</span></p>
                <p className="text-gray-500">Submitted At: <span className="font-normal">{new Date(quiz.createdAt).toLocaleString()}</span></p>
                <button
                  onClick={() => handleReattempt(quiz)}
                  className="mt-4 bg-yellow-500 text-white font-semibold p-2 rounded-lg hover:bg-yellow-600 transition"
                >
                  Reattempt Quiz
                </button>
              </div>
            ))}
          </div>
        ) : (
          status !== 'loading' && <p className="text-center text-gray-500">No quizzes found for the selected filters.</p>
        )}
      </div>
    </div>
  );
};

export default QuizHistory;
