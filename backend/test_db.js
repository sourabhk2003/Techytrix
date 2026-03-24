import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const run = async () => {
   try {
      await mongoose.connect(process.env.MONGODB_URL);
      const db = mongoose.connection.db;
      const lectures = await db.collection("lectures").find().sort({createdAt: -1}).limit(5).toArray();
      console.log("=== LECTURE DUMP ===");
      lectures.forEach(l => {
         console.log(`Title: ${l.lectureTitle}`);
         console.log(`URL: ${l.videoUrl}`);
         console.log(`Created: ${l.createdAt}`);
         console.log('-------------------');
      });
      process.exit(0);
   } catch (e) {
      console.error(e);
      process.exit(1);
   }
};

run();
