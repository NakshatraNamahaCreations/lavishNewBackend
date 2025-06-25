import express from "express"
import { addTheme, getAllThemes, updateTheme, deleteTheme, getThemebySubSubcategoryId } from "../../controllers/Category/themeController.js"
import { adminauthenticateToken } from "../../middleware/admin/authMiddleware.js"
import upload from "../../middleware/multer/multer.js"

const router = express.Router()

router.post("/create", adminauthenticateToken,   addTheme)
router.put("/update/:id", adminauthenticateToken, updateTheme)
router.delete("/delete/:id", deleteTheme)

router.get("/", getAllThemes)
router.get("/subsubCategory/:subSubCategoryId", getThemebySubSubcategoryId)

export default router