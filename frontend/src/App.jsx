import { useEffect, useState } from "react";
import "./App.css";
import LoginPage from "./pages/Loginpage";
import { Route, Routes } from "react-router-dom";
import Layout from "./Layout";
import Homepage from "./pages/Homepage";
import Register from "./pages/Registerpage";
import axios from "axios";
import { useDispatch } from "react-redux";
import { login } from "./store/slices/userSlics";
import Quiz from "./pages/Quiz";
import QuizHistory from "./pages/QuizHistory";
axios.defaults.baseURL="http://localhost:5000";


function App() {
  const dispatch = useDispatch();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      axios
        .get('/auth/getuser', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          dispatch(login({ user: response.data.user, token }));
        })
        .catch((error) => {
          console.error('Failed to fetch user data', error);
        });
    }
  }, [dispatch, token]);

  return (
    <div>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Homepage/>}/>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/quizhistory" element={<QuizHistory/>}/>
        </Route>
      </Routes>
    </div>
  );
}

export default App;
