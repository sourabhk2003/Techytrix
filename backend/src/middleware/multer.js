import multer from "multer";


let storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,"./public")

    },
    filename:(req,file,cb)=>{
        let ext = "";
        if (file.mimetype === "application/pdf" && !file.originalname.toLowerCase().endsWith('.pdf')) {
            ext = ".pdf";
        }
        cb(null,Date.now()+"-"+file.originalname+ext)
    }
})


const upload = multer({storage});

export default upload;