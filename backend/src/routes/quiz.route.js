import express from "express";
import authUser from "../middleware/auth.middleware.js";
import { createQuiz, getQuizzesByCourse, submitQuizResult, editQuiz, deleteQuiz } from "../controllers/quiz.controller.js";

const quizRouter = express.Router();

quizRouter.post('/create/:courseId', authUser, createQuiz);
quizRouter.get('/course/:courseId', authUser, getQuizzesByCourse);
quizRouter.post('/submit/:quizId', authUser, submitQuizResult);
quizRouter.post('/edit/:quizId', authUser, editQuiz);
quizRouter.delete('/remove/:quizId', authUser, deleteQuiz);

export default quizRouter;
