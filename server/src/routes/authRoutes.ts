import express from "express";
import {
  login,
  logout,
  refreshAccessToken,
  register,getCurrentUser
} from "../controllers/authController";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", logout);
router.get("/me", getCurrentUser);

export default router;
