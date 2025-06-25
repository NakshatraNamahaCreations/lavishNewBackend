import express from 'express';
import { getAllUsers, getUserCount, getUsersWithPagination, getUserById, deleteUser, updateUserProfile, getUserProfile } from '../../controllers/admin/userController.js';
import { authenticateToken } from '../../middleware/authMiddleware.js';
const router = express.Router();

// Route to get all users
router.get('/', getAllUsers);
router.get('/getCount', getUserCount);

// Route to get users with pagination
router.get('/paginated', getUsersWithPagination);

// Route to get user by ID
router.get('/:id', getUserById);
router.delete('/user/:id', deleteUser);
router.put('/user/profile', authenticateToken, updateUserProfile);
router.get('/user/profile', authenticateToken, getUserProfile);

export default router; 