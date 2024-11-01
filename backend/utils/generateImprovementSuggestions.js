const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function generateImprovementSuggestions(quizResponses) {

    console.log('quizzzz',quizResponses);
    
    const incorrectResponses = quizResponses.filter(r => !r.isCorrect);
    const notAttemptedResponses = quizResponses.filter(r => r.userResponse === null || r.userResponse === '');
    const prompt = `
        Based on the following quiz responses, please provide two suggestions for improvement. You need to tell the user what should he/she do to improve the score:
        Incorrect Responses: ${JSON.stringify(incorrectResponses)}
        Not Attempted Responses: ${JSON.stringify(notAttemptedResponses)}
    `;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            model: 'llama3-8b-8192', 
        });

        const suggestionsText = chatCompletion.choices[0]?.message?.content || '';
        const suggestions = suggestionsText.split('\n').filter(s => s.trim() !== ''); 
        
        return suggestions;
    } catch (error) {
        console.error('Error generating improvement suggestions from AI:', error.message);
        throw new Error('Failed to generate suggestions');
    }
}

module.exports = generateImprovementSuggestions;
