import axios from 'axios'
import React, { useEffect, useState } from 'react'
import {useSelector} from 'react-redux'
import {useNavigate, useParams} from 'react-router-dom'
import { serverUrl } from '../../../App'
import { FaArrowLeftLong } from 'react-icons/fa6'
import { FaPlayCircle } from 'react-icons/fa'



function ViewLectures(){
 const {courseId} = useParams()
 const {courseData} = useSelector(state => state.course)

 const {userData} = useSelector(state => state.user)
 const selectedCourse = courseData?.courses?.find(
  (course) => course._id === courseId
)

 const [creatorData, setCreatorData] = useState(null)
 const [quizzes, setQuizzes] = useState([])
 const [progressMap, setProgressMap] = useState({})
 const [selectedLecture, setSelectedLecture] = useState(null)

 // Log history when a lecture is selected
 const handleSelectLecture = (lecture) => {
   setSelectedLecture(lecture);
   if (userData && courseId && lecture?._id) {
     axios.post(serverUrl + '/api/user/lecture-history', {
       courseId,
       lectureId: lecture._id,
       lectureTitle: lecture.lectureTitle,
       courseTitle: selectedCourse?.title
     }, { withCredentials: true }).catch(() => {});
   }
 };

 
 const navigate = useNavigate()


useEffect(()=>{
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

  // Auto-resume: fetch last watched for this course
  const fetchLastWatched = async () => {
    try {
      const result = await axios.get(serverUrl + `/api/user/lecture-history/${courseId}`, { withCredentials: true });
      const lastLectureId = result.data.lastLecture?.lectureId;
      if (lastLectureId && selectedCourse?.lectures) {
        const found = selectedCourse.lectures.find(l => l._id === lastLectureId);
        if (found) setSelectedLecture(found);
      }
    } catch (e) {
      // fallback to first lecture
      if (selectedCourse?.lectures?.[0]) setSelectedLecture(selectedCourse.lectures[0]);
    }
  };

  fetchQuizzes();
  fetchLastWatched();
}, [courseId, selectedCourse]);

useEffect(()=>{
    
    const handleCreator = async () =>{

        if(selectedCourse?.creator){
        try {
            const result = await axios.post(serverUrl + '/api/course/creator',{userId:selectedCourse?.creator}, {withCredentials:true});
            
           (setCreatorData(result.data))

        } catch (error) {
            console.log(error);
            
        }
    }
    }
    handleCreator();
},[selectedCourse])

  return (
    <div className="min-h-screen bg-[#05060b] text-white">

      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 
      lg:grid-cols-[1.5fr_1fr] gap-8">

<div className="space-y-6">

  {/* HEADER */}
  <div className="flex items-center gap-4">
    <FaArrowLeftLong
      onClick={() => navigate('/')}
      className="cursor-pointer text-white/70 hover:text-white"
    />

    <div>
      <h1 className="text-xl sm:text-2xl font-semibold">
        {selectedCourse?.title}
      </h1>
      <p className="text-xs tracking-widest uppercase text-white/40">
        {selectedCourse?.category} · {selectedCourse?.level}
      </p>
    </div>
  </div>

  {/* VIDEO section */}
  <div className="relative rounded-2xl overflow-hidden bg-black border border-white/10">

    <div className="aspect-video flex items-center justify-center relative w-full bg-black">
      {(() => {
        if (!selectedLecture?.videoUrl) {
          return (
            <div className="flex flex-col items-center gap-4 text-center p-4">
              <FaPlayCircle className="text-6xl text-white/70 mx-auto" />
              <p className="text-xs tracking-[0.4em] uppercase text-white/50">
                Select a lecture
              </p>
            </div>
          );
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
              {/* Transparent shield - blocks right click */}
              <div style={{ position: 'absolute', inset: 0, zIndex: 10, userSelect: 'none', pointerEvents: 'none' }} />
              {/* Fullscreen Button */}
              <button
                onClick={() => { const el = document.querySelector('#pdf-frame-v'); if (el) { if (!document.fullscreenElement) el.requestFullscreen(); else document.exitFullscreen(); } }}
                className="absolute top-3 right-3 z-20 px-3 py-1.5 bg-black/60 hover:bg-black/80 text-white text-xs rounded-lg border border-white/20 backdrop-blur-sm transition flex items-center gap-1.5"
              >
                ⛶ Fullscreen
              </button>
              <iframe
                id="pdf-frame-v"
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

    <div className="px-4 py-3 border-t border-white/10">
      <p className="text-xs uppercase tracking-widest text-white/40">
        Now Playing
      </p>
      <p className="text-sm font-medium">
        {selectedLecture?.lectureTitle || "Idle"}
      </p>
    </div>
  </div>

</div>

<div className="space-y-6">

  {/* LECTURES */}
  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">

    <h2 className="text-sm tracking-[0.4em] uppercase text-white/40 mb-4">
      Lectures
    </h2>

    <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2">
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
            <h4 className="text-xs font-bold text-emerald-400/90 mb-2 uppercase tracking-wide px-1">{folderName}</h4>
            <div className="space-y-3">
              {lecturesArray.map((lecture) => {
                const active = selectedLecture?._id === lecture._id;
                const currentIndex = overallIndex++;

                return (
                  <button
                    key={lecture._id || currentIndex}
                    onClick={() => handleSelectLecture(lecture)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left
                      transition
                      ${
                        active
                          ? "bg-white/20 border border-white/30 ring-1 ring-emerald-400/50"
                          : "bg-white/5 border border-white/10 hover:bg-white/10"
                      }
                    `}
                  >
                    <div
                      className={`w-2 h-2 rounded-full hidden sm:block ${
                        active ? "bg-emerald-400" : "bg-white/40"
                      }`}
                    />

                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">
                        Lecture {currentIndex}
                      </p>
                      <p className={`text-sm font-medium truncate ${active ? "text-emerald-300" : "text-white/90"}`}>
                        {lecture.lectureTitle}
                      </p>
                    </div>

                    <FaPlayCircle
                      className={`text-lg shrink-0 ${
                        active ? "text-emerald-400" : "text-white/40"
                      }`}
                    />
                  </button>
                )
              })}
            </div>
          </div>
        ));
      })()}
    </div>
  </div>

  {/* QUIZZES */}
  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mt-6">
    <h2 className="text-sm tracking-[0.4em] uppercase text-white/40 mb-4">
      Quizzes
    </h2>
    <div className="space-y-3">
      {quizzes?.map((quiz, index) => {
        const myProg = progressMap[quiz._id];
        const lockedByAttempts = quiz.maxAttempts > 0 && (myProg?.attempts >= quiz.maxAttempts);
        const attemptsText = quiz.maxAttempts > 0 ? `Attempts: ${myProg?.attempts || 0}/${quiz.maxAttempts}` : `Attempts: ${myProg?.attempts || 0}`;

        return (
          <button
            key={index}
            disabled={lockedByAttempts}
            onClick={() => !lockedByAttempts && navigate(`/takequiz/${courseId}/${quiz._id}`)}
            className={`
              w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition
              ${!lockedByAttempts
                ? "bg-blue-500/10 border border-blue-500/20 hover:bg-white/10"
                : "opacity-50 cursor-not-allowed bg-white/5 border border-white/10"}
            `}
          >
            <div className="flex flex-col text-left">
              <span className="font-medium">{quiz.quizTitle}</span>
              <span className="text-xs text-white/50">{attemptsText}</span>
            </div>
            {lockedByAttempts ? (
              <span className="text-red-400 text-[10px] font-bold tracking-widest">MAXED OUT</span>
            ) : (
              <span className="text-blue-400 text-[10px] font-bold px-2 py-1 bg-blue-600/20 rounded">TAKE QUIZ</span>
            )}
          </button>
        )
      })}
      {(!quizzes || quizzes.length === 0) && <p className="text-xs text-white/40">No quizzes available.</p>}
    </div>
  </div>

  {/* Creator Info */}

  <div className='bg-white/5 border border-white/10 rounded-2xl'>
    <h1 className='text-xl text-center mt-3 text-white/80 hover:underline'>Educator</h1>
  <div className="  p-4 flex items-center gap-4">
  
    <img
      src={creatorData?.photoUrl}
      className="w-20 h-20 rounded-full object-cover border border-white/20"
    />
    <div>
      
      <h2 className=" text-lg font-semibold">{creatorData?.name}</h2>
      <p className="text-xs text-white/60">{creatorData?.description}</p>
      <p className="text-xs text-white/40">{creatorData?.email}</p>
    </div>
  </div></div>

</div>

</div>
</div>

 
);

}

export default ViewLectures
