import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { serverUrl } from '../../../App.jsx';
import { useEffect } from 'react';

const CreateQuiz = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  
  const [quizTitle, setQuizTitle] = useState('');
  const [maxAttempts, setMaxAttempts] = useState(0);
  const [questions, setQuestions] = useState([
    { questionText: '', options: ['', '', '', ''], correctAnswer: '', explanation: '' }
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editId) {
      const fetchQuiz = async () => {
        try {
          const res = await axios.get(`${serverUrl}/api/quiz/course/${courseId}`, { withCredentials: true });
          const targetQuiz = res.data.quizzes.find(q => q._id === editId);
          if (targetQuiz) {
            setQuizTitle(targetQuiz.quizTitle);
            setMaxAttempts(targetQuiz.maxAttempts);
            // Ensure backwards compatibility where older quizzes lack explanation
            const mappedQuestions = targetQuiz.questions.map(q => ({
               ...q, explanation: q.explanation || ''
            }));
            setQuestions(mappedQuestions);
          }
        } catch (err) {
          toast.error("Failed to load quiz for editing");
        }
      };
      fetchQuiz();
    }
  }, [editId, courseId]);

  const handleAddQuestion = () => {
    setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctAnswer: '', explanation: '' }]);
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const handleSaveQuiz = async () => {
    if (!quizTitle.trim()) return toast.error("Quiz Title is required");
    
    // basic validation
    for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.questionText.trim() || !q.correctAnswer.trim()) {
            return toast.error(`Question ${i+1} is incomplete.`);
        }
    }

    setLoading(true);
    try {
      if (editId) {
          await axios.post(
            `${serverUrl}/api/quiz/edit/${editId}`,
            { quizTitle, questions, maxAttempts, isPublished: true },
            { withCredentials: true }
          );
          toast.success("Quiz Updated Successfully!");
      } else {
          await axios.post(
            `${serverUrl}/api/quiz/create/${courseId}`,
            { quizTitle, questions, maxAttempts, isPublished: true },
            { withCredentials: true }
          );
          toast.success("Quiz Created Successfully!");
      }
      navigate(-1);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error creating quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0d12] text-white px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold">{editId ? 'Edit Quiz' : 'Create a Quiz'}</h1>
        
        <div className="bg-[#11131a] p-6 rounded-xl border border-white/10">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm text-white/70 mb-2">Quiz Title</label>
              <input
                type="text"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 focus:outline-none"
                placeholder="e.g. Midterm Evaluation"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Max Attempts</label>
              <input
                type="number"
                min="0"
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 focus:outline-none"
                placeholder="0 for unlimited"
              />
              <p className="text-xs text-white/40 mt-1">Leave as 0 for unlimited attempts.</p>
            </div>
          </div>

          <h2 className="text-lg font-semibold mb-4">Questions</h2>
          {questions.map((q, qIndex) => (
            <div key={qIndex} className="p-4 bg-white/5 border border-white/10 rounded-lg mb-4">
              <label className="block text-sm mb-1">Question {qIndex + 1}</label>
              <input
                type="text"
                value={q.questionText}
                onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 mb-4 focus:outline-none"
                placeholder="Enter question text..."
              />

              <div className="grid grid-cols-2 gap-4 mb-4">
                {q.options.map((opt, oIndex) => (
                  <input
                    key={oIndex}
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 focus:outline-none"
                    placeholder={`Option ${oIndex + 1}`}
                  />
                ))}
              </div>

              <label className="block text-sm mb-1 text-green-400">Correct Answer (Must match exactly one option)</label>
              <input
                type="text"
                value={q.correctAnswer}
                onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)}
                className="w-full bg-black/40 border border-green-500/30 rounded-lg px-3 py-2 mb-4 focus:outline-none"
                placeholder="e.g. Option 1 text..."
              />

              <label className="block text-sm mb-1 text-blue-400">Explanation / Solution (Optional)</label>
              <textarea
                value={q.explanation}
                onChange={(e) => handleQuestionChange(qIndex, 'explanation', e.target.value)}
                rows={2}
                className="w-full bg-black/40 border border-blue-500/30 rounded-lg px-3 py-2 focus:outline-none placeholder:text-white/30"
                placeholder="Explain why this answer is correct..."
              />
            </div>
          ))}

          <div className="flex justify-between mt-6">
            <button
              onClick={handleAddQuestion}
              className="px-4 py-2 bg-white/10 rounded-lg text-sm hover:bg-white/20 transition"
            >
              + Add Question
            </button>
            <button
              onClick={handleSaveQuiz}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              {loading ? "Saving..." : "Save Quiz"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateQuiz;
