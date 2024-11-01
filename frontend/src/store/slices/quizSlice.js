// quizSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async action to fetch quiz data
export const fetchQuiz = createAsyncThunk(
  'quiz/fetchQuiz',
  async ({ grade, subject, totalQuestions, maxScore, difficulty }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        '/quiz/create',
        {
          grade,
          Subject: subject,
          TotalQuestions: totalQuestions,
          MaxScore: maxScore,
          Difficulty: difficulty.toUpperCase(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async action to submit quiz answers
export const submitQuiz = createAsyncThunk(
  'quiz/submitQuiz',
  async ({ quizId, responses }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.post(
        '/quiz/submit',
        { quizId, responses },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async action to fetch quiz history
export const fetchQuizHistory = createAsyncThunk(
  'quiz/fetchQuizHistory',
  async ({ from, to, grade, subject }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.get('/quiz/history', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          from,
          to,
          grade,
          subject,
        },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
export const fetchQuizById = createAsyncThunk(
  'quiz/fetchQuizById',
  async ({ quizId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(`/quiz/getQuiz/${quizId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Initial state for the quiz slice
const initialState = {
  quiz: null,
  userResponses: {},
  status: 'idle',
  error: null,
  score: null,
  submitted: false,
  quizHistory: [], // Added quiz history
};

// Quiz slice
const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    setUserResponse: (state, action) => {
      const { questionId, userResponse } = action.payload;
      state.userResponses[questionId] = userResponse;
    },
  },
  extraReducers: (builder) => {
    // Handle fetchQuiz lifecycle
    builder
      .addCase(fetchQuiz.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchQuiz.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.quiz = action.payload;
      })
      .addCase(fetchQuiz.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchQuizById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchQuizById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.quiz = action.payload;
        state.submitted = false;
      })
      .addCase(fetchQuizById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Handle submitQuiz lifecycle
      .addCase(submitQuiz.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(submitQuiz.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.score = action.payload.score;
        state.submitted = true;
      })
      .addCase(submitQuiz.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })


      // Handle fetchQuizHistory lifecycle
      .addCase(fetchQuizHistory.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchQuizHistory.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.quizHistory = action.payload; // Store the fetched quiz history
      })
      .addCase(fetchQuizHistory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
      
  },
});

// Export actions for use in components
export const { setUserResponse } = quizSlice.actions;
export default quizSlice.reducer;
