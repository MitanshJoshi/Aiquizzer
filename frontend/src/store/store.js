import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlics';
import quizReducer from './slices/quizSlice'

const store = configureStore({
  reducer: {
    user: userReducer,
    quiz:quizReducer
  },
});

export default store;
