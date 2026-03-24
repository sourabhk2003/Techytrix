import uploadOnCloudinary from "./src/config/cloudinary.js";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

try {
  fs.writeFileSync("public/testfile.pdf", "%PDF-1.4 dummy file");
  uploadOnCloudinary("public/testfile.pdf").then(res => {
     fs.writeFileSync("result.txt", "SUCCESS:" + res);
     process.exit(0);
  }).catch(e => {
     fs.writeFileSync("result.txt", "PROMISE REJECT:" + e.message);
     process.exit(1);
  });
} catch(e) {
  fs.writeFileSync("result.txt", "CRASH:" + e.stack);
  process.exit(1);
}
