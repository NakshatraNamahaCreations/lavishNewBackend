import express from 'express';
import { createWishlist, getWishlist, removeItemFromWishlist, getWishlistCount } from '../controllers/WishlistController.js';

const router = express.Router();

// Route to create a wishlist
router.post('/create', createWishlist);
router.get('/count/:customerId', getWishlistCount);

// Route to get the wishlist by customerId
router.get('/:customerId', getWishlist);

// Route to remove a service from wishlist
router.delete('/remove-item/:customerId/:serviceId', removeItemFromWishlist);

export default router;

