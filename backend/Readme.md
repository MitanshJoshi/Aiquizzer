1. **AI-Powered Quiz Generation:**
   - Quizzes are generated using Groq AI based on user-provided grade, subject, number of questions, and difficulty level.
   - Each question has four options with one correct answer.
   
2. **Quiz Submission & Scoring:**
   - Users can submit their answers, and the app will calculate the score based on their responses.
   - The app checks if the user has already submitted a quiz and allows re-evaluation.

3. **Personalized Suggestions (AI-Powered):**
   - After submitting a quiz, the app generates two AI-powered suggestions based on incorrect and unanswered responses, helping users improve their skills.

4. **Quiz History with Filtering:**
   - Users can view their quiz history and filter by date range, grade, and subject.
   - Redis caching is used to optimize performance by storing quiz history temporarily.

5. **Retry Functionality:**
   - Users can retry previously submitted quizzes, re-evaluating their scores based on updated answers.

6. **Email Notifications:**
   - Users receive an email with their quiz results, including personalized suggestions for improvement.
