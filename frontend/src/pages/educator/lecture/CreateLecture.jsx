import axios from "axios";
import React, { useEffect, useState } from 'react'
import { FaArrowLeftLong } from 'react-icons/fa6'
import {useDispatch, useSelector} from 'react-redux'
import { useNavigate, useParams  } from 'react-router-dom'
import { serverUrl } from "../../../App.jsx";
import { ClipLoader } from "react-spinners";
import { setLectureData } from "../../../redux/lectureSlice.js";

import { toast } from "sonner";
import { FaEdit, FaTrash } from "react-icons/fa";

const CreateLecture = () => {

  const {courseId} = useParams()
  const navigate = useNavigate() 
  const [lectureTitle, setLectureTitle] = useState("")
  const [folderName, setFolderName] = useState("")
  const [loading, setLoading] = useState(false)
  const [expandedFolders, setExpandedFolders] = useState({});
  const [selectedLectures, setSelectedLectures] = useState([]);
  const dispatch = useDispatch()

  const {lectureData} = useSelector(state=>state.lecture)

  const toggleFolder = (folderName) => {
     setExpandedFolders(prev => ({ ...prev, [folderName]: !prev[folderName] }));
  };

  const handleDeleteLecture = async (lectureId) => {
    if(!window.confirm("Are you sure you want to delete this lecture?")) return;
    try {
      await axios.delete(`${serverUrl}/api/course/removelecture/${lectureId}`, { withCredentials: true });
      dispatch(setLectureData(lectureData.filter(l => l._id !== lectureId)));
      toast.success("Lecture deleted");
    } catch(err) {
      toast.error("Failed to delete lecture");
    }
  };

  const toggleLectureSelection = (lectureId) => {
    setSelectedLectures(prev => 
      prev.includes(lectureId) ? prev.filter(id => id !== lectureId) : [...prev, lectureId]
    );
  };

  const isFolderFullySelected = (lecturesArray) => {
    return lecturesArray.length > 0 && lecturesArray.every(l => selectedLectures.includes(l._id));
  };

  const toggleFolderSelection = (e, lecturesArray) => {
    e.stopPropagation();
    const folderLectureIds = lecturesArray.map(l => l._id);
    const fullySelected = isFolderFullySelected(lecturesArray);
    
    if (fullySelected) {
      setSelectedLectures(prev => prev.filter(id => !folderLectureIds.includes(id)));
    } else {
      setSelectedLectures(prev => {
        const newSet = new Set([...prev, ...folderLectureIds]);
        return Array.from(newSet);
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLectures.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedLectures.length} selected lectures?`)) return;
    
    setLoading(true);
    try {
      await Promise.all(selectedLectures.map(id => 
         axios.delete(`${serverUrl}/api/course/removelecture/${id}`, { withCredentials: true })
      ));
      
      const newLectureData = lectureData.filter(l => !selectedLectures.includes(l._id));
      dispatch(setLectureData(newLectureData));
      setSelectedLectures([]);
      toast.success(`Successfully deleted ${selectedLectures.length} lectures`);
    } catch (err) {
      toast.error("An error occurred during bulk delete");
    } finally {
      setLoading(false);
    }
  };
  
  // Bulk upload states
  const [bulkFiles, setBulkFiles] = useState(null)
  const [bulkUploading, setBulkUploading] = useState(false)
  const [bulkProgress, setBulkProgress] = useState(0)
  const [bulkTotal, setBulkTotal] = useState(0)

  const handleBulkUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setBulkUploading(true);
    setBulkTotal(files.length);
    setBulkProgress(0);

    let updatedLectures = [...(lectureData || [])];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Extract folder name from webkitRelativePath
        const pathParts = file.webkitRelativePath ? file.webkitRelativePath.split('/') : [];
        const extractedFolder = pathParts.length > 2 ? pathParts[pathParts.length - 2] : (pathParts.length === 2 ? pathParts[0] : "");

        // 1. Create lecture with filename
        const titleResp = await axios.post(
          serverUrl + `/api/course/createlecture/${courseId}`,
          { lectureTitle: file.name, folderName: extractedFolder },
          { withCredentials: true }
        );
        
        let newLectureId = titleResp.data.lecture._id;
        
        // 2. Upload file to that lecture
        const formData = new FormData();
        formData.append('videoUrl', file);
        formData.append('isPreviewFree', false);
        
        const uploadResp = await axios.post(
          serverUrl + `/api/course/editlecture/${newLectureId}`,
          formData,
          { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } }
        );
        
        updatedLectures.push(uploadResp.data.lecture);
        // Ensure UI updates iteratively
        dispatch(setLectureData([...updatedLectures]));
        setBulkProgress(prev => prev + 1);
      }
      toast.success(`Successfully uploaded ${files.length} files!`);
    } catch (error) {
       console.log("Error during bulk upload:", error);
       toast.error("Bulk upload was interrupted due to an error.");
    } finally {
       setBulkUploading(false);
       setBulkFiles(null);
       e.target.value = null; // Reset input
    }
  };

  const handleCreateLecture = async () =>{

   if (!lectureTitle.trim()) {
    toast.error("Lecture title is required");
    return;
  }

   setLoading(true)
   try {
       const result = await axios.post(serverUrl + `/api/course/createlecture/${courseId}`,{lectureTitle, folderName},{withCredentials:true})
       

       

       dispatch(
  setLectureData([...(lectureData || []), result.data.lecture])
);


        setLoading(false)
        toast.success("Lecture Added ")
        setLectureTitle('')

   } catch (error) {
    console.log("Error while creating lecture:", error);
   setLoading(false)
    toast.error(error?.response?.data?.message || "Failed to create lecture")

   
   }


  }











  useEffect(()=>{
    const getCourseLecture = async () =>{
     try {
      const result = await axios.get(serverUrl + `/api/course/courselecture/${courseId}`,{withCredentials:true})
       console.log(result.data);
      dispatch(setLectureData(result.data.course.lectures))
    //  dispatch(setLectureData(result.data.lectures))



     } catch (error) {
      console.log("Error while fetching course lectures:", error);

     }


    }
    getCourseLecture();

  },[]) 


return (
  <div className="min-h-screen bg-[#0b0d12] text-white px-4 py-10">
    <div className="max-w-5xl mx-auto space-y-10">

      {/* HEADER */}
      <div className="flex items-start gap-4">
        <FaArrowLeftLong
          onClick={() => navigate(`/editcourses/${courseId}`)}
          className="mt-1 cursor-pointer text-white/60 hover:text-white transition"
        />

        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Course Lectures
          </h1>
          <p className="text-sm text-white/50 max-w-xl mt-1">
            Manage your course structure.  
            Each lecture includes its <span className="text-white/70">title</span> and
            <span className="text-white/70"> video content</span>.
          </p>
        </div>
      </div>

     
      <div className="
        rounded-xl
        border border-white/10
        bg-gradient-to-r from-[#121523] to-[#0e1019]
        px-6 py-4
        text-sm text-white/70
      ">
        ✏️ <span className="font-medium text-white/80">Edit Lecture</span> allows you to
        update the lecture title, replace or upload a new video, and manage its content
        without affecting other lectures.
      </div>

      {/* CREATE LECTURE */}
      <div className="
        rounded-2xl
        border border-white/10
        bg-[#11131a]
        p-6
      ">
        <h2 className="text-lg font-semibold mb-1">
          Add a new lecture
        </h2>
        <p className="text-sm text-white/50 mb-5">
          This lecture will be added to your course timeline and can be edited later.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={lectureTitle}
            onChange={(e) => setLectureTitle(e.target.value)}
            placeholder="Lecture Title"
            className="
              flex-1
              bg-black/40
              border border-white/10
              rounded-lg
              px-4 py-3
              text-sm
              placeholder:text-white/40
              focus:outline-none
              focus:border-white/30
            "
          />
          <input
            type="text"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="Chapter/Folder (Optional)"
            className="
              flex-1
              bg-black/40
              border border-white/10
              rounded-lg
              px-4 py-3
              text-sm
              placeholder:text-white/40
              focus:outline-none
              focus:border-white/30
            "
          />

          <button
            onClick={handleCreateLecture}
            disabled={loading || bulkUploading}
            className="
              px-7 py-3
              rounded-lg
              bg-white
              text-black
              text-sm font-medium
              hover:opacity-90
              transition
              flex items-center justify-center
            "
          >
             {loading ? <ClipLoader size={18} color="black" /> : "Add Single"}
          </button>
        </div>

        {/* BULK UPLOAD DIVIDER */}
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10"></div>
          <span className="text-xs text-white/40 uppercase tracking-widest">OR</span>
          <div className="h-px flex-1 bg-white/10"></div>
        </div>

         {/* BULK UPLOAD SECTION */}
         <div>
          <h3 className="text-sm font-medium mb-2 text-white/80">Bulk Upload Folder</h3>
          <p className="text-xs text-white/40 mb-3">
            Select a folder containing your videos/files. They will be uploaded and added as lectures automatically.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
             <input
              type="file"
              webappdirectory="true"
              webkitdirectory="true"
              directory="true"
              multiple
              onChange={handleBulkUpload}
              disabled={bulkUploading || loading}
              className="
                flex-1 text-sm text-white/60
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-medium
                file:bg-white/10 file:text-white
                hover:file:bg-white/20
                cursor-pointer
              "
            />
          </div>
          {bulkUploading && (
             <div className="mt-4 bg-white/5 rounded-lg p-4 flex flex-col items-center border border-white/10">
                <ClipLoader size={24} color="#ffffff" className="mb-2" />
                <p className="text-sm font-medium text-white/90">
                  Uploading {bulkProgress} / {bulkTotal} files...
                </p>
                <p className="text-xs text-white/50 mt-1 text-center">
                  Please do not close or refresh this page. Cloudinary is processing the files.
                </p>
             </div>
          )}
        </div>
      </div>

      {/* LECTURE LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
            <h3 className="text-sm uppercase tracking-widest text-white/40">
            Existing lectures
            </h3>
            {selectedLectures.length > 0 && (
                <button
                onClick={handleBulkDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-600/20 text-red-500 hover:bg-red-600/30 font-medium text-xs rounded-lg transition border border-red-500/20"
                >
                <FaTrash className="inline mr-2 -mt-0.5" />
                Delete {selectedLectures.length} Selected
                </button>
            )}
        </div>

        {lectureData?.length === 0 && (
          <div className="
            rounded-xl
            border border-dashed border-white/20
            bg-white/[0.02]
            p-8
            text-center
            text-white/50
            text-sm
          ">
            No lectures added yet.  
            Start by adding your first lecture above.
          </div>
        )}

        {lectureData?.length > 0 && (() => {
           const grouped = {};
           lectureData.forEach(lecture => {
              const folder = lecture.folderName || "Main Course Content";
              if (!grouped[folder]) grouped[folder] = [];
              grouped[folder].push(lecture);
           });
           
           let overallIndex = 1;

           return Object.entries(grouped).map(([folderName, lecturesArray]) => {
              const isOpen = expandedFolders[folderName] !== false; // default true

              return (
                <div key={folderName} className="mb-6">
                  <div 
                    onClick={() => toggleFolder(folderName)}
                    className="flex justify-between items-center bg-white/5 px-4 py-3 rounded-t-xl border border-white/10 cursor-pointer hover:bg-white/10 transition"
                  >
                     <div className="flex items-center gap-3">
                       <input 
                         type="checkbox" 
                         checked={isFolderFullySelected(lecturesArray)}
                         onChange={(e) => toggleFolderSelection(e, lecturesArray)}
                         onClick={(e) => e.stopPropagation()}
                         className="w-4 h-4 cursor-pointer accent-blue-500"
                       />
                       <h4 className="text-sm font-bold text-white/90 uppercase tracking-wide">
                         📁 {folderName} ({lecturesArray.length})
                       </h4>
                     </div>
                     <span className="text-white/40 text-xs">{isOpen ? "▲ Collapse" : "▼ Expand"}</span>
                  </div>
                  
                  {isOpen && (
                    <div className="border border-x border-b border-light/10 border-white/10 rounded-b-xl bg-[#12141c] p-3 space-y-2">
                      {lecturesArray.map((lecture) => {
                         const currentIndex = overallIndex++;
                         return (
                            <div key={lecture._id || currentIndex} className="group flex items-center justify-between gap-4 px-4 py-3 rounded-lg border border-white/5 bg-[#171a25] hover:bg-white/10 transition">
                               <div className="flex items-center gap-4 min-w-0">
                                  <input 
                                     type="checkbox" 
                                     checked={selectedLectures.includes(lecture._id)}
                                     onChange={() => toggleLectureSelection(lecture._id)}
                                     className="w-4 h-4 cursor-pointer accent-blue-500 mr-2"
                                  />
                                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs font-medium text-white/70">
                                    {currentIndex}
                                  </div>
                                  <div className="min-w-0">
                                     <p className="text-sm font-medium truncate">{lecture.lectureTitle}</p>
                                     <p className="text-[10px] text-white/40 mt-1">Video content / Docs</p>
                                  </div>
                               </div>
                               <div className="flex gap-2 shrink-0">
                                  <button onClick={() => navigate(`/editlecture/${courseId}/${lecture._id}`)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-xs font-medium transition" title="Edit lecture">
                                     <FaEdit size={12} /> Edit
                                  </button>
                                  <button onClick={() => handleDeleteLecture(lecture._id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs font-medium transition" title="Delete lecture">
                                     <FaTrash size={12} /> Delete
                                  </button>
                               </div>
                            </div>
                         );
                      })}
                    </div>
                  )}
                </div>
              );
           });
        })()}
      </div>

    </div>
  </div>
);

 










 
  

  
}

export default CreateLecture