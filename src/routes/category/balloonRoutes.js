import express from "express";
import {
  addBalloon,
  getAllBalloons,
  updateBalloon,
  deleteBalloon,
} from "../../controllers/Category/BalloonsController.js";
import { adminauthenticateToken } from "../../middleware/admin/authMiddleware.js";

const router = express.Router();

router.post("/create", adminauthenticateToken, addBalloon);
router.put("/update/:id", adminauthenticateToken, updateBalloon);
router.delete("/delete/:id",  deleteBalloon);
router.get("/", getAllBalloons);
// router.post("/create", adminauthenticateToken , addBalloon )

export default router;
