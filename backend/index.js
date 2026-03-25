
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
 
// CORS configuration
const allowedOrigins = [
  "http://localhost:5173", 
  "http://127.0.0.1:5173", 
  process.env.FRONTEND_URL
].filter(Boolean);

console.log("Allowed Origins:", allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
        callback(null, true);
      } else {
        console.error(`Origin ${origin} not allowed by CORS`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
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
