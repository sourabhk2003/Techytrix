import mongoose from "mongoose";

const lectureHistorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    lectureId: { type: mongoose.Schema.Types.ObjectId, ref: "Lecture", required: true },
    lectureTitle: { type: String },
    courseTitle: { type: String },
    viewedAt: { type: Date, default: Date.now }
});

// Compound index to quickly find last watched per course per user
lectureHistorySchema.index({ userId: 1, courseId: 1, lectureId: 1 }, { unique: true });

const LectureHistory = mongoose.model("LectureHistory", lectureHistorySchema);

export default LectureHistory;
