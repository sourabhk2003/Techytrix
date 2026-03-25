import express from "express";
import { chatWithAi } from "../controllers/chat.controller.js";

const chatRouter = express.Router();

chatRouter.post("/", chatWithAi);

export default chatRouter;
