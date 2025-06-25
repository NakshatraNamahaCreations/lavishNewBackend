import express from 'express';
import { createWishlist, getWishlist, removeItemFromWishlist } from '../controllers/WishlistController.js';

const router = express.Router();

// Route to create a wishlist
router.post('/create', createWishlist);

// Route to get the wishlist by customerId
router.get('/:customerId', getWishlist);

// Route to remove a service from wishlist
router.delete('/remove-item/:customerId/:serviceId', removeItemFromWishlist);

export default router;



// {
//     "message": "Wishlist fetched successfully",
//     "wishlist": [
//       {
//         "_id": "5f8f9c1b9f1b2c3e4b0a8a6a",
//         "customerId": {
//           "_id": "userId123",
//           "firstName": "John",
//           "lastName": "Doe",
//           "email": "john.doe@example.com"
//         },
//         "serviceId": {
//           "_id": "serviceId456",
//           "name": "Wedding Photography",
//           "description": "Professional wedding photography services",
//           "images": [
//             "wedding_photography1.jpg",
//             "wedding_photography2.jpg"
//           ]
//         },
//         "serviceName": "Wedding Photography",
//         "createdAt": "2025-05-20T12:30:00.000Z",
//         "updatedAt": "2025-05-20T12:30:00.000Z"
//       }
//     ]
//   }
  