
import express from 'express';
import dotenv from 'dotenv';
import connectDB from './src/config/database.js';
import cookieParser from 'cookie-parser';
import router from './src/routes/auth.route.js';
import cors from 'cors';
import userRouter from './src/routes/user.route.js';
import courseRouter from './src/routes/course.route.js';
import paymentRouter from './src/routes/payment.route.js';
import reviewRouter from './src/routes/review.route.js';
import quizRouter from './src/routes/quiz.route.js';
import chatRouter from './src/routes/chat.route.js';

dotenv.config();


const PORT = process.env.PORT;

const app = express();
app.use(express.json());
app.use(cookieParser());


/*  app.use(cors({
   origin: 'https://ai-powered-lms-website-with-mern-stack-1.onrender.com',
  //  origin: "http://localhost:5173",
   credentials: true,
 })) */; 
 

 const allowedOrigins = ["http://localhost:5173", "http://127.0.0.1:5173", process.env.FRONTEND_URL].filter(Boolean);

 app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
 


app.use('/api/auth',router)
app.use('/api/user',userRouter)
app.use('/api/course',courseRouter)
app.use('/api/order',paymentRouter)
app.use('/api/review',reviewRouter)
app.use('/api/quiz',quizRouter)
app.use('/api/chat',chatRouter)



app.get('/', (req, res) => {
  res.send('Hello, Techytrix! The backend is running.');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();



});
