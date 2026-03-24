import express from 'express';
import authUser from '../middleware/auth.middleware.js';
import { getCurrentUser, updateProfile, getUserProgress, logLectureHistory, getLectureHistory, getLastWatchedForCourse } from '../controllers/user.controller.js';
import upload from '../middleware/multer.js';


const userRouter = express.Router();


userRouter.get('/getcurrentuser',authUser, getCurrentUser)
userRouter.get('/progress',authUser, getUserProgress)
userRouter.post('/profile',authUser,upload.single('photoUrl') , updateProfile)

// Lecture history routes
userRouter.post('/lecture-history', authUser, logLectureHistory)
userRouter.get('/lecture-history', authUser, getLectureHistory)
userRouter.get('/lecture-history/:courseId', authUser, getLastWatchedForCourse)


export default userRouter;