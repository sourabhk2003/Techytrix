import uploadOnCloudinary from '../config/cloudinary.js';
import User from '../models/user.model.js';
import { QuizProgress } from '../models/quizProgress.model.js';
import LectureHistory from '../models/lectureHistory.model.js';



export const getCurrentUser = async (req, res) => {  
try {
 const  user = await User.findById(req.userId).select('-password').populate('enrolledCourses')
 if(!user){
    return res.status(404).json({message: 'User not found'})
 }
 return res.status(200).json(user)
    
} catch (error) {
    return res.status(500).json({message: `GetCurrent User: ${error.message}`})
    
}


}



export const updateProfile = async (req, res) => {
 
    try {
        const userId = req.userId;
        const { name, description } = req.body;
        let photoUrl 
        if (req.file) {
            photoUrl = await uploadOnCloudinary(req.file.path);
        }

        const user = await User.findByIdAndUpdate( userId,{
            name,
            description,
            photoUrl
        })

        res.json(user);



        if(!user){
         return res.status(404).json({message: 'User not found'})
         }

         await user.save();
        return res.status(200).json(user)
   


    } catch (error) {
        return res.status(500).json({message: `Update Profile Error: ${error.message}`})
        
    }

}

export const getUserProgress = async (req, res) => {
    try {
        const userId = req.userId;
        const quizList = await QuizProgress.find({ studentId: userId }).populate('quizId');
        
        let totalQuizzesAttempted = quizList.length;
        let totalQuestionsAnswered = 0;
        let totalScore = 0;
        let totalMaxScore = 0;
        
        quizList.forEach(q => {
            totalQuestionsAnswered += q.totalQuestions;
            totalScore += q.score;
            totalMaxScore += q.totalQuestions;
        });
        
        const weightedAverage = totalMaxScore > 0 ? ((totalScore / totalMaxScore) * 100).toFixed(2) : 0;
        
        return res.status(200).json({
            totalQuizzesAttempted,
            totalQuestionsAnswered,
            totalScore,
            weightedAverage
        });
    } catch(err) {
        res.status(500).json({ message: "Failed to fetch progress", error: err.message });
    }
}

// Log a lecture view (upsert - updates viewedAt if already exists)
export const logLectureHistory = async (req, res) => {
    try {
        const userId = req.userId;
        const { courseId, lectureId, lectureTitle, courseTitle } = req.body;

        await LectureHistory.findOneAndUpdate(
            { userId, courseId, lectureId },
            { userId, courseId, lectureId, lectureTitle, courseTitle, viewedAt: new Date() },
            { upsert: true, new: true }
        );

        return res.status(200).json({ message: "History logged" });
    } catch(err) {
        res.status(500).json({ message: "Failed to log history", error: err.message });
    }
}

// Get last 30 lecture views for profile activity feed
export const getLectureHistory = async (req, res) => {
    try {
        const userId = req.userId;
        const history = await LectureHistory.find({ userId })
            .sort({ viewedAt: -1 })
            .limit(30)
            .lean();

        return res.status(200).json({ history });
    } catch(err) {
        res.status(500).json({ message: "Failed to fetch history", error: err.message });
    }
}

// Get last watched lecture for a specific course (for auto-resume)
export const getLastWatchedForCourse = async (req, res) => {
    try {
        const userId = req.userId;
        const { courseId } = req.params;

        const last = await LectureHistory.findOne({ userId, courseId })
            .sort({ viewedAt: -1 })
            .lean();

        return res.status(200).json({ lastLecture: last || null });
    } catch(err) {
        res.status(500).json({ message: "Failed to fetch last watched", error: err.message });
    }
}

