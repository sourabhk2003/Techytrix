import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { serverUrl } from '../../../App';
import { FaArrowLeftLong } from 'react-icons/fa6';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { toast } from 'sonner';

const ManageQuizzes = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [quizzes, setQuizzes] = useState([]);
    
    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const res = await axios.get(`${serverUrl}/api/quiz/course/${courseId}`, { withCredentials: true });
                setQuizzes(res.data.quizzes || []);
            } catch (err) {
                console.log(err);
            }
        };
        fetchQuizzes();
    }, [courseId]);

    const handleDelete = async (quizId) => {
        if(!window.confirm("Are you sure you want to delete this quiz?")) return;
        try {
            await axios.delete(`${serverUrl}/api/quiz/remove/${quizId}`, { withCredentials: true });
            toast.success("Quiz Deleted");
            setQuizzes(quizzes.filter(q => q._id !== quizId));
        } catch(err) {
            toast.error("Failed to delete quiz");
        }
    };

    return (
        <div className="min-h-screen bg-[#0b0d12] text-white px-4 py-10">
          <div className="max-w-5xl mx-auto space-y-10">
             <div className="flex items-start gap-4">
                <FaArrowLeftLong onClick={() => navigate(`/editcourses/${courseId}`)} className="mt-1 cursor-pointer text-white/60 hover:text-white transition" />
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight">Course Quizzes</h1>
                  <p className="text-sm text-white/50 max-w-xl mt-1">Manage evaluations and tests for this course.</p>
                </div>
             </div>

             <div className="flex justify-between items-center rounded-2xl border border-white/10 bg-[#11131a] p-6">
                <div>
                   <h2 className="text-lg font-semibold mb-1">Add a new Quiz</h2>
                   <p className="text-sm text-white/50">Create comprehensive tests with multiple choices and explanations.</p>
                </div>
                <button onClick={() => navigate(`/createquiz/${courseId}`)} className="px-6 py-3 rounded-lg bg-white text-black font-medium hover:opacity-90">
                   Create Quiz
                </button>
             </div>

             <div className="space-y-4">
               <h3 className="text-sm uppercase tracking-widest text-white/40">Existing Quizzes</h3>
               {(!quizzes || quizzes.length === 0) && (
                   <div className="rounded-xl border border-dashed border-white/20 bg-white/[0.02] p-8 text-center text-white/50 text-sm">
                      No quizzes added yet. Start by creating a new quiz.
                   </div>
               )}
               {quizzes && quizzes.map((quiz, idx) => (
                  <div key={quiz._id} className="group flex items-center justify-between gap-4 px-5 py-4 rounded-xl border border-white/10 bg-[#12141c] hover:bg-[#171a25] transition">
                     <div className="flex items-center gap-4 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-sm font-medium text-white/70">{idx + 1}</div>
                        <div className="min-w-0">
                           <p className="text-sm font-medium truncate">{quiz.quizTitle}</p>
                           <p className="text-xs text-white/40 mt-1">{quiz.questions?.length || 0} Questions • Max Attempts: {quiz.maxAttempts === 0 ? "Unlimited" : quiz.maxAttempts}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <button onClick={() => navigate(`/createquiz/${courseId}?edit=${quiz._id}`)} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-xs font-medium text-white/70 hover:text-white hover:border-white/30 hover:bg-white/10 transition">
                            <FaEdit size={13} /> Edit
                        </button>
                        <button onClick={() => handleDelete(quiz._id)} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/30 text-xs font-medium text-red-400 hover:bg-red-500/10 transition">
                            <FaTrash size={13} /> Delete
                        </button>
                     </div>
                  </div>
               ))}
             </div>
          </div>
        </div>
    );
};
export default ManageQuizzes;
