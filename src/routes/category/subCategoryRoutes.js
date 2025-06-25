import express from 'express';
import {
    createSubCategory,
    getAllSubCategories,
    getSubCategoriesByCategory,
    deleteSubCategory,
    updatedSubcategory,
    searchSubCategory
} from '../../controllers/Category/subCategoryController.js';

import { adminauthenticateToken } from "../../middleware/admin/authMiddleware.js"

const router = express.Router();

router.post('/create', adminauthenticateToken, createSubCategory);
router.delete('/delete/:id', adminauthenticateToken, deleteSubCategory);
router.put('/update/:id',  updatedSubcategory);

router.get('/', getAllSubCategories);
router.get('/category/:categoryId', getSubCategoriesByCategory);
router.get('/search/:searchText', searchSubCategory);

export default router; 