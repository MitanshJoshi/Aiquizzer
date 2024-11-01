import { selectIsAuthenticated, selectUser } from '@/store/slices/userSlics';
import React from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';

const Navbar = () => {
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const navigate = useNavigate();

  const handlelogout = () => {
    localStorage.removeItem("token");
    setTimeout(() => {
      navigate("/");
    }, 1000);
  };

  return (
    <div className='fixed top-0 left-0 h-[10vh] w-full flex items-center p-10 bg-yellow-400 justify-between text-black z-50 shadow-md'>
      <Link to={"/"} className='font-[600] text-[20px] '>
        AiQuizzer
      </Link>
      <div className='font-[500] flex gap-5'>
        <Link to={'/quiz'}>Quiz</Link>
        <Link to={'/quizhistory'} className='cursor-pointer'>My Quiz</Link>
        <div className='cursor-pointer' onClick={handlelogout}>Logout</div>
        {isAuthenticated ? (
          <div>
            <Button>Welcome, {user.username}</Button>
          </div>
        ) : (
          <Link to={"/login"}>Register/Login</Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;
