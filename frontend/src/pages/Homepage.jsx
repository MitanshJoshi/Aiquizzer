import { Button } from '@/components/ui/button';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Homepage = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-gray-50 min-h-screen ">
      <section className=" text-black py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to AIQuizzer</h1>
          <p className="text-lg md:text-xl mb-8">Boost your learning with AI-powered quizzes and smart assessments</p>
          <Link to={"/login"} className="bg-black text-white font-bold py-2 px-6 rounded-full hover:bg-gray-700 hover:text-white transition duration-300">Get Started</Link>
        </div>
      </section>
      
        <div className='w-full h-[1px] bg-yellow-400'>

        </div>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10">Why Choose AIQuizzer?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <h3 className="text-2xl font-semibold mb-4">AI-Powered Quizzes</h3>
              <p>Get personalized quizzes tailored to your knowledge level.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <h3 className="text-2xl font-semibold mb-4">Instant Feedback</h3>
              <p>Receive immediate feedback to enhance your learning.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <h3 className="text-2xl font-semibold mb-4">Track Progress</h3>
              <p>Monitor your growth with detailed performance reports.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-yellow-400 text-black py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Ace Your Quizzes?</h2>
          <p className="text-lg mb-8">Start your AIQuizzer journey today and boost your skills effortlessly.</p>
          <Link to={"/login"} className="text-white bg-black font-bold py-2 px-6 rounded-full hover:bg-gray-700 hover:text-white transition duration-300">Sign Up Now</Link>
        </div>
      </section>
    </div>
  );
};

export default Homepage;
