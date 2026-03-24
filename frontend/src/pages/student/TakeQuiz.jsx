import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { serverUrl } from '../../App.jsx';

const TakeQuiz = () => {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fisher-Yates shuffle algorithm
  const shuffleArray = (array) => {
    let shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/quiz/course/${courseId}`, { withCredentials: true });
        const targetQuiz = res.data.quizzes.find(q => q._id === quizId);
        if (targetQuiz) {
          setQuiz(targetQuiz);
          const myProg = res.data.progressMap?.[quizId];
          if (targetQuiz.maxAttempts > 0 && myProg && myProg.attempts >= targetQuiz.maxAttempts) {
             toast.error("You have reached the maximum number of attempts for this quiz.");
             return navigate(-1);
          }
          setShuffledQuestions(shuffleArray(targetQuiz.questions));
        } else {
          toast.error("Quiz not found");
        }
      } catch (error) {
        toast.error("Failed to load quiz");
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [courseId, quizId]);

  const handleSelect = (qId, option) => {
    setAnswers({ ...answers, [qId]: option });
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post(
        `${serverUrl}/api/quiz/submit/${quizId}`,
        { answers },
        { withCredentials: true }
      );
      setResult(res.data.result);
      toast.success("Quiz submitted!");
    } catch (error) {
      toast.error("Error submitting quiz");
    }
  };

  if (loading) return <div className="text-white text-center mt-20">Loading Quiz...</div>;
  if (!quiz) return <div className="text-white text-center mt-20">Quiz unavailable.</div>;

  return (
    <div className="min-h-screen bg-[#0b0d12] text-white px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center">{quiz.quizTitle}</h1>

        {result ? (
          <div className="space-y-8">
            <div className="bg-[#11131a] p-8 rounded-xl border border-white/10 text-center">
              <h2 className="text-2xl font-bold mb-4">Quiz Results</h2>
              <div className="text-6xl font-black mb-4">{result.score} <span className="text-2xl text-white/50">/ {result.totalQuestions}</span></div>
              <p className={`text-xl font-medium ${result.isPassed ? 'text-green-400' : 'text-red-400'}`}>
                {result.isPassed ? 'Passed! Excellent work.' : 'Failed. Keep practicing!'}
              </p>
              <button onClick={() => navigate(-1)} className="mt-8 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition">Return to Course</button>
            </div>
            
            <div className="bg-[#11131a] p-6 rounded-xl border border-white/10">
               <h3 className="text-xl font-bold mb-6">Detailed Review</h3>
               <div className="space-y-6">
                 {quiz.questions.map((q, idx) => {
                    const studentAns = result.userAnswers?.[q._id] || answers[q._id];
                    const isCorrect = studentAns?.toString().trim().toLowerCase() === q.correctAnswer?.toString().trim().toLowerCase();
                    
                    return (
                        <div key={q._id} className={`p-4 rounded-xl border ${isCorrect ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                           <p className="font-semibold text-lg mb-3">{idx + 1}. {q.questionText}</p>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-4">
                              <div className="p-3 rounded-lg bg-white/5">
                                 <span className="text-white/50 block mb-1">Your Answer:</span>
                                 <span className={isCorrect ? 'text-green-400 font-medium' : 'text-red-400 font-medium'}>
                                   {studentAns || "Not Answered"}
                                 </span>
                              </div>
                              <div className="p-3 rounded-lg bg-green-500/10">
                                 <span className="text-green-400/70 block mb-1">Correct Answer:</span>
                                 <span className="text-green-400 font-medium">{q.correctAnswer}</span>
                              </div>
                           </div>
                           
                           {q.explanation && (
                              <div className="mt-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                <p className="text-blue-400 font-semibold mb-1 text-sm">Explanation / Solution:</p>
                                <p className="text-blue-200/80 text-sm leading-relaxed">{q.explanation}</p>
                              </div>
                           )}
                        </div>
                    );
                 })}
               </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#11131a] p-8 rounded-xl border border-white/10 space-y-8">
            {shuffledQuestions.map((q, index) => (
              <div key={q._id} className="p-4 bg-white/5 rounded-lg border border-white/5">
                <p className="font-semibold text-lg mb-4">{index + 1}. {q.questionText}</p>
                <div className="space-y-2">
                  {q.options.map((opt, oIdx) => (
                    <div 
                      key={oIdx}
                      onClick={() => handleSelect(q._id, opt)}
                      className={`p-3 rounded-lg border cursor-pointer transition ${
                        answers[q._id] === opt 
                          ? 'bg-blue-600 border-blue-400' 
                          : 'bg-black/20 border-white/10 hover:border-white/30'
                      }`}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            <button
              onClick={handleSubmit}
              className="w-full py-4 bg-green-600 rounded-lg font-bold text-lg hover:bg-green-700 transition"
            >
              Submit Results
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TakeQuiz;
