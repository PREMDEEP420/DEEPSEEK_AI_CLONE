import express from "express";
import { login, logout, signup } from "../controller/user.controller.js";

const router = express.Router();

// Test route (IMPORTANT for browser testing)
router.get("/", (req, res) => {
  res.send("User API working 🚀");
});

router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);

export default router;
