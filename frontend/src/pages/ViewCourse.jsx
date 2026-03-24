import React, { useEffect, useState } from 'react'
import {FaArrowLeftLong, FaCirclePlay, FaLock, FaStar} from 'react-icons/fa6' 
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux'
import { setSelectedCourse } from '../redux/courseSlice';
import axios from 'axios'
import { serverUrl } from '../App';

import empty from '../assets/empty.jpg'
import Card from '../component/Card';
import { toast } from "sonner";
import { ClipLoader } from 'react-spinners';




const ViewCourse = () => {
const navigate = useNavigate()
const {courseId} = useParams()
const {courseData} = useSelector(state=>state.course)
const {selectedCourse} = useSelector(state=>state.course)
const {userData} = useSelector(state=>state.user)

const isCreator =userData && selectedCourse &&
  userData._id?.toString() === selectedCourse.creator?.toString();


  
const [selectedLecture, setSelectedLecture] = useState(null)
const [creatorData, setCreatorData] = useState(null)

const [creatorCourses, setCreatorCourses] = useState([])

const [isEnrolled, setIsEnrolled] = useState(false)

const [rating, setRating] = useState(0)
const [comment, setComment] = useState('')
const [loading, setLoading] = useState(false)
const [quizzes, setQuizzes] = useState([])
const [progressMap, setProgressMap] = useState({})

const dispatch = useDispatch()






useEffect(() => {
  if (!courseId || !courseData?.courses) return;

  
  setSelectedLecture(null);
   setCreatorCourses([]);
   

  
  

  const course = courseData.courses.find(
    c => c._id.toString() === courseId.toString()
  );

  if (course) {
    dispatch(setSelectedCourse(course));
  }
}, [courseId, courseData, dispatch]);







useEffect(() => {
  if (!selectedCourse?.creator) return;

  const handleCreator = async () => {
    try {
      const result = await axios.post(
        serverUrl + '/api/course/creator',
        { userId: selectedCourse.creator },
        { withCredentials: true }
      );
      setCreatorData(result.data);
    } catch (e) {
      console.log(e);
    }
  };

  handleCreator();
}, [selectedCourse,courseId]);




useEffect(() => {
  if (!userData || !courseId) return;

  const verify = userData.enrolledCourses?.some(
    c => (typeof c === "string" ? c : c._id).toString() === courseId.toString()
  );

  setIsEnrolled(isCreator || !!verify);

}, [courseId, userData]);


useEffect(() => {
  if (!courseId) return;
  const fetchQuizzes = async () => {
    try {
      const result = await axios.get(serverUrl + `/api/quiz/course/${courseId}`, { withCredentials: true });
      setQuizzes(result.data.quizzes);
      setProgressMap(result.data.progressMap || {});
    } catch (e) {
      console.log(e);
    }
  };
  fetchQuizzes();
}, [courseId]);






useEffect(() => {
  if (!creatorData?._id || !courseData?.courses) return;

  const creatorCoursesFiltered = courseData.courses.filter(
    course =>
      course.creator === creatorData._id &&
      course._id !== courseId
  );

  setCreatorCourses(creatorCoursesFiltered);
}, [creatorData, courseData, courseId]);




const handleEnroll = async(courseId, userId) => {
    try {
        // FREE COURSE: bypass Razorpay entirely
        if (!selectedCourse?.price || selectedCourse.price === 0) {
            const res = await axios.post(serverUrl + '/api/order/free-enroll', {courseId}, {withCredentials: true});
            setIsEnrolled(true);
            toast.success(res.data.message || 'Enrolled successfully!');
            return;
        }

        // PAID COURSE: Razorpay flow
        const orderData = await axios.post(serverUrl + '/api/order/razorpay-order', {userId, courseId}, {withCredentials: true})

        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: orderData.data.amount,
            name: "TECHYTRIX",
            description: "COURSE ENROLLMENT PAYMENT",
            order_id: orderData.data.id,
            handler: async function (response) {
                try {
                    const verifyPayment = await axios.post(serverUrl + '/api/order/verifypayment', {
                        ...response, courseId, userId
                    }, {withCredentials: true})
                    setIsEnrolled(true)
                    toast.success(verifyPayment.data.message)
                } catch (error) {
                    toast.error(error.response?.data?.message || 'Payment verification failed')
                }
            }
        }

        if (!window.Razorpay) {
            toast.error("Payment service not available. Please try again.");
            return;
        }

        const rzp = new window.Razorpay(options);
        rzp.open();

    } catch (error) {
        console.log(error);
        toast.error('Something went wrong while enrolling.')
    }
}


const handleReview = async () => {

  if (!userData) {
    toast.error("Login required");
    return;
  }

  if (rating === 0) {
    toast.error("Please select a rating");
    return;
  }

  // 🔒 IMPORTANT: enrolled OR creator
  if (!isEnrolled && !isCreator) {
    toast.error("Enroll in the course to submit a review");
    return;
  }

  setLoading(true);

  try {
    const result = await axios.post(
      serverUrl + '/api/review/createreview',
      { rating, comment, courseId },
      { withCredentials: true }
    );

    toast.success(result.data.message);
    setRating(0);
    setComment("");
  } catch (error) {
    console.log(error);
    toast.error(error.response?.data?.message || "Something went wrong");
  } finally {
    setLoading(false);
  }
};



const calculateAvgReview = (reviews) =>{
    if(!reviews || reviews.length === 0) return 0;
    const total = reviews.reduce((sum , review)=>sum + review.rating, 0)
    return Number((total / reviews.length).toFixed(1))

}

const avgRating = calculateAvgReview(selectedCourse?.reviews)




if (!selectedCourse) {
  return (
    <div className="min-h-screen flex items-center justify-center text-white/60">
      Loading course...
    </div>
  );
}



return (
  <div className="min-h-screen bg-[#0b0f19] text-white">

    {/* ===== HERO SECTION ===== */}
    <section className="relative overflow-hidden border-b border-white/10">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-transparent to-emerald-500/20 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-14 items-center">

      
        <div>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm text-green-400 font-medium transition hover:text-white mb-6"
          >
            <FaArrowLeftLong />
            Back
          </button>

          <h1 className="text-4xl lg:text-5xl font-semibold leading-tight">
            {selectedCourse?.title}
          </h1>

          <p className="mt-4 text-white/60 max-w-xl">
            {selectedCourse?.subTitle}
          </p>

          <div className="flex items-center gap-4 mt-6">
            <span className="flex items-center gap-1 text-amber-400 font-medium">
              {avgRating} <FaStar /> 
            </span>
            <span className="text-white/40 text-sm">
              ({selectedCourse?.reviews?.length || 0} reviews)
            </span>
          </div>

          <div className="flex items-end gap-3 mt-6">
            {/* <span className="text-3xl text-green-600 font-semibold">
                {!isEnrolled?`₹${selectedCourse?.price}`:'Watch now'}
             
            </span> */}
         {!isEnrolled && (
  <span className="text-3xl text-green-600 font-semibold">
    {selectedCourse?.price === 0 ? "FREE" : `₹${selectedCourse?.price}`}
  </span>
)}






            <span className="line-through text-white/40 text-sm">
              ₹5999
            </span>
          </div>

          <ul className="mt-6 space-y-2 text-sm text-white/70">
            <li>•✅ 250+ hours of structured video content</li>
            <li>•✅ Industry-level projects</li>
            <li>•✅ Lifetime access</li>
          </ul>

          {!isCreator && !isEnrolled && (
  <button
   
    onClick={() => {
  if (!userData) {
    toast.error("Login required");
    return;
  }
  handleEnroll(courseId, userData._id);
}}

    className="mt-8 inline-flex items-center justify-center px-8 py-3 rounded-full bg-white text-black font-medium hover:scale-[1.04] transition"
  >
    Enroll Now
  </button>
)}

{(isCreator || isEnrolled) && (
  <button
    onClick={() => navigate(`/viewlecture/${courseId}`)}
    className="mt-8 inline-flex items-center justify-center px-8 py-3 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/30"
  >
    Watch Course
  </button>
)}



        </div>

        {/* RIGHT */}
        <div className="relative rounded-3xl overflow-hidden border border-white/10">
          {selectedCourse?.thumbnail ? (
            <img
              src={selectedCourse.thumbnail}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <img src={empty} alt="" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        </div>
      </div>
    </section>

    {/* ===== MAIN CONTENT ===== */}
    <section className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-[360px_1fr] gap-14">

      {/* lecture Part  */}
       <aside className="bg-white/5 border border-white/10 rounded-3xl p-6 h-fit">
        <h3 className="text-lg font-semibold mb-1">Course Curriculum</h3>
        <p className="text-xs text-white/40 mb-6">
          {selectedCourse?.lectures?.length} lectures
        </p>

        <div className="space-y-4">
          {(() => {
             const grouped = {};
             selectedCourse?.lectures?.forEach(lecture => {
                const folder = lecture.folderName || "Main Course Content";
                if (!grouped[folder]) grouped[folder] = [];
                grouped[folder].push(lecture);
             });
             
             let overallIndex = 1;

             return Object.entries(grouped).map(([folderName, lecturesArray]) => (
                <div key={folderName} className="mb-4 last:mb-0">
                  <h4 className="text-sm font-bold text-white/80 mb-2 uppercase tracking-wide bg-white/5 py-1 px-3 rounded-md border border-white/10">{folderName}</h4>
                  <div className="space-y-2">
                    {lecturesArray.map((lecture) => {
                       const unlocked = lecture.isPreviewFree || isEnrolled || isCreator;
                       const currentIndex = overallIndex++;
                       
                       return (
                          <button
                            key={lecture._id || currentIndex}
                            disabled={!unlocked}
                            onClick={() => unlocked && setSelectedLecture(lecture)}
                            className={`
                              w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition
                              ${unlocked
                                ? "hover:bg-white/10 hover:scale-[1.01]"
                                : "opacity-40 cursor-not-allowed"}
                              ${selectedLecture?.lectureTitle === lecture.lectureTitle
                                ? "bg-white/10 ring-1 ring-emerald-400/30"
                                : ""}
                            `}
                          >
                            <span className="text-left font-medium">
                              {currentIndex}. {lecture.lectureTitle}
                            </span>
            
                            {unlocked ? (
                              <FaCirclePlay className="text-emerald-400 shrink-0" />
                            ) : (
                              <FaLock className="text-white/40 shrink-0" />
                            )}
                          </button>
                       );
                    })}
                  </div>
                </div>
             ));
          })()}
        </div>

        <div className="space-y-2 mt-8">
          <h3 className="text-lg font-semibold mb-1">Course Quizzes & Tests</h3>
          {quizzes?.map((quiz, index) => {
            const unlocked = isEnrolled || isCreator;
            const myProg = progressMap[quiz._id];
            const lockedByAttempts = quiz.maxAttempts > 0 && (myProg?.attempts >= quiz.maxAttempts);
            const attemptsText = quiz.maxAttempts > 0 ? `Attempts: ${myProg?.attempts || 0}/${quiz.maxAttempts}` : `Attempts: ${myProg?.attempts || 0}`;

            return (
              <button
                key={index}
                disabled={!unlocked || lockedByAttempts}
                onClick={() => unlocked && !lockedByAttempts && navigate(`/takequiz/${courseId}/${quiz._id}`)}
                className={`
                  w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition
                  ${unlocked
                    ? "hover:bg-white/10 hover:scale-[1.01] bg-blue-500/10 border border-blue-500/20"
                    : "opacity-40 cursor-not-allowed bg-white/5"}
                `}
              >
                <div className="flex flex-col text-left">
                   <span className="font-medium">Quiz: {quiz.quizTitle}</span>
                   {unlocked && <span className="text-xs text-white/50">{attemptsText}</span>}
                </div>
                {lockedByAttempts ? <span className="text-red-400 text-[10px] font-bold tracking-widest">MAXED OUT</span> : 
                  (unlocked ? <span className="text-blue-400 text-xs font-bold px-2 py-1 bg-blue-600/20 rounded">TAKE QUIZ</span> : <FaLock className="text-white/40" />)}
              </button>
            )
          })}
        </div>
      </aside>

      

      {/* VIDEO + REVIEW */}
      
         <div>
        <div className="aspect-video rounded-3xl overflow-hidden bg-[#05060b] flex items-center justify-center border border-white/10 mb-10 relative">
          {(() => {
            if (!selectedLecture?.videoUrl) {
              return <span className="text-white/40 text-sm">Select a lecture from curriculum to view content</span>;
            }
            
            const url = selectedLecture.videoUrl;
            const isVideo = url.match(/\.(mp4|mkv|webm|ogg|mov)$/i) || url.includes('/video/upload/');
            const isImage = url.match(/\.(jpg|jpeg|png|gif|webp)$/i) || (url.includes('/image/upload/') && !url.match(/\.pdf$/i));
            const isPdfOrDoc = url.match(/\.(pdf|ppt|pptx|doc|docx)$/i);

            if (isVideo) {
              return <video src={url} controls controlsList="nodownload" className="w-full h-full object-contain" />;
            } else if (isImage) {
              return <img src={url} alt="Lecture content" className="w-full h-full object-contain" />;
            } else if (isPdfOrDoc) {
              const secureUrl = url.replace("http://", "https://");
              return (
                <div
                  className="w-full h-full relative"
                  onContextMenu={(e) => e.preventDefault()}
                >
                  {/* Transparent shield */}
                  <div style={{ position: 'absolute', inset: 0, zIndex: 10, userSelect: 'none', pointerEvents: 'none' }} />
                  {/* Fullscreen Button */}
                  <button
                    onClick={() => { const el = document.querySelector('#pdf-frame-c'); if (el) { if (!document.fullscreenElement) el.requestFullscreen(); else document.exitFullscreen(); } }}
                    className="absolute top-3 right-3 z-20 px-3 py-1.5 bg-black/60 hover:bg-black/80 text-white text-xs rounded-lg border border-white/20 backdrop-blur-sm transition flex items-center gap-1.5"
                  >
                    ⛶ Fullscreen
                  </button>
                  <iframe
                    id="pdf-frame-c"
                    src={`${secureUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                    className="w-full h-full border-0"
                    title="Lecture Document"
                  />
                </div>
              );
            } else {
              return (
                <div className="flex flex-col items-center justify-center space-y-4 p-8 text-center bg-white/5 w-full h-full">
                  <p className="text-white/60">This file type cannot be previewed directly in the browser.</p>
                  <a href={url} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition">
                    Download / Open File
                  </a>
                </div>
              );
            }
          })()}
        </div>

        {/* REVIEW */}
         <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <h3 className="text-lg font-semibold mb-4">Write a Review</h3>

          <div className="flex gap-1 mb-4">
            {[1, 2, 3, 4, 5].map(star => (
              <FaStar
                key={star}
                onClick={() => setRating(star)}
                className={`cursor-pointer ${
                  star <= rating ? "text-amber-400" : "text-white/30"
                }`}
              />
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="
              w-full
              resize-none
              rounded-xl
              bg-black/40
              border border-white/10
              p-3
              text-sm
              focus:outline-none
              focus:ring-1 focus:ring-emerald-400/40
            "
            placeholder="Share your experience…"
          />

          <button
            disabled={loading}
            onClick={handleReview}
            
            className="mt-4 px-6 py-2 rounded-full bg-white text-black text-sm font-medium"
          >
            {loading ? <ClipLoader size={18} color="black" /> : "Submit Review"}
          </button>
        </div>



        

      </div>
    </section>

    {/* ===== CREATOR ===== */}
    <section className="max-w-7xl mx-auto px-6 pb-20">
      <div className="flex items-center gap-4 border-t border-white/10 pt-10">
        <img
          src={creatorData?.photoUrl || empty}
          className="w-16 h-16 rounded-full object-cover border border-white/20"
        />
        <div>
          <h4 className="font-semibold">{creatorData?.name}</h4>
          <p className="text-sm text-white/50">{creatorData?.description}</p>
          <p className="text-xs text-white/40">{creatorData?.email}</p>
        </div>
      </div>

      {creatorCourses?.length > 0 && (
        <>
          <h3 className="mt-14 mb-6 text-xl font-semibold">
            More from this educator
          </h3>

          <div className="flex flex-wrap gap-6">
            {creatorCourses.map((course, index) => (
              <Card
                key={course._id || index}
                thumbnail={course.thumbnail}
                id={course._id}
                price={course.price}
                title={course.title}
                rating={course.rating}
                reviews={course.reviews}
                category={course.category}
              />
            ))}
          </div>
        </>
      )}
    </section>

  </div>
);

  

}

export default ViewCourse
