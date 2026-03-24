import mongoose from "mongoose";

const quizProgressSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    attempts: { type: Number, default: 0 },
    isPassed: { type: Boolean, required: true },
    userAnswers: { type: Map, of: String, default: {} }
}, { timestamps: true });

export const QuizProgress = mongoose.model('QuizProgress', quizProgressSchema);
export default QuizProgress;
