import express from 'express';
import { createCategory, getAllCategories, deleteCategory } from '../../controllers/category/categoryController.js';
import { adminauthenticateToken } from "../../middleware/admin/authMiddleware.js"

const router = express.Router();

router.post('/create', adminauthenticateToken, createCategory);
router.delete('/delete/:id',  deleteCategory);


router.get('/', getAllCategories);

export default router; 