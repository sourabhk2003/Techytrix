import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    quizTitle: { type: String, required: true },
    questions: [
        {
            questionText: { type: String, required: true },
            options: [{ type: String, required: true }],
            correctAnswer: { type: String, required: true },
            explanation: { type: String, default: "" }
        }
    ],
    maxAttempts: { type: Number, default: 0 }, // 0 means unlimited
    isPublished: { type: Boolean, default: false }
}, { timestamps: true });

export const Quiz = mongoose.model('Quiz', quizSchema);
export default Quiz;
