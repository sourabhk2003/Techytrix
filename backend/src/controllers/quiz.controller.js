import Quiz from "../models/quiz.model.js";
import QuizProgress from "../models/quizProgress.model.js";

// Educator functions
export const createQuiz = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { quizTitle, questions, maxAttempts, isPublished } = req.body;
        
        if (!quizTitle || !questions || questions.length === 0) {
            return res.status(400).json({ message: "Quiz title and questions are required" });
        }
        
        const quiz = await Quiz.create({
            courseId,
            quizTitle,
            questions,
            maxAttempts: maxAttempts ? parseInt(maxAttempts) : 0,
            isPublished
        });
        
        return res.status(201).json({ message: "Quiz created successfully", quiz });
    } catch (error) {
        res.status(500).json({ message: "Create Quiz error", error: error.message });
    }
};

export const getQuizzesByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.userId;
        const quizzes = await Quiz.find({ courseId });
        
        let progressMap = {};
        if (userId) {
             const progressList = await QuizProgress.find({ studentId: userId });
             progressList.forEach(p => { progressMap[p.quizId.toString()] = p; });
        }

        return res.status(200).json({ quizzes, progressMap });
    } catch (error) {
        res.status(500).json({ message: "Get Quizzes error", error: error.message });
    }
};

// Student function
export const submitQuizResult = async (req, res) => {
    try {
        const { quizId } = req.params;
        const { answers } = req.body; // map of questionId -> selectedOption String
        const userId = req.userId;
        
        const quiz = await Quiz.findById(quizId);
        if (!quiz) return res.status(404).json({ message: "Quiz not found" });

        let progress = await QuizProgress.findOne({ studentId: userId, quizId });
        
        if (quiz.maxAttempts > 0) {
            const currentAttempts = progress ? progress.attempts : 0;
            if (currentAttempts >= quiz.maxAttempts) {
                return res.status(403).json({ message: "Max attempts reached for this quiz" });
            }
        }
        
        let score = 0;
        quiz.questions.forEach((q) => {
            const userAns = answers[q._id]?.toString().trim().toLowerCase();
            const correctAns = q.correctAnswer?.toString().trim().toLowerCase();
            if (userAns && userAns === correctAns) {
                score += 1;
            }
        });
        
        const totalQuestions = quiz.questions.length;
        const isPassed = (score / totalQuestions) >= 0.5; // pass threshold 50%
        
        if (progress) {
            progress.score = score;
            progress.isPassed = isPassed;
            progress.attempts += 1;
            progress.userAnswers = answers;
            await progress.save();
        } else {
            progress = await QuizProgress.create({
                studentId: userId,
                quizId,
                score,
                totalQuestions,
                attempts: 1,
                isPassed,
                userAnswers: answers
            });
        }
        
        return res.status(200).json({ message: "Quiz evaluated successfully", result: progress });
    } catch (error) {
        res.status(500).json({ message: "Submit Quiz error", error: error.message });
    }
};

export const editQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        const { quizTitle, questions, maxAttempts, isPublished } = req.body;
        
        const quiz = await Quiz.findById(quizId);
        if(!quiz) return res.status(404).json({ message: "Quiz not found" });

        quiz.quizTitle = quizTitle || quiz.quizTitle;
        quiz.maxAttempts = maxAttempts !== undefined ? parseInt(maxAttempts) : quiz.maxAttempts;
        quiz.isPublished = isPublished !== undefined ? isPublished : quiz.isPublished;
        if(questions && questions.length > 0) quiz.questions = questions;
        
        await quiz.save();
        return res.status(200).json({ message: "Quiz updated successfully", quiz });
    } catch(err) {
        res.status(500).json({ message: "Edit Quiz error", error: err.message });
    }
};

export const deleteQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        await Quiz.findByIdAndDelete(quizId);
        await QuizProgress.deleteMany({ quizId });
        return res.status(200).json({ message: "Quiz deleted successfully" });
    } catch(err) {
        res.status(500).json({ message: "Delete Quiz error", error: err.message });
    }
};
