import express from 'express';
import { createTicket, getTickets, checkOrderStatusAndTicketStatus } from '../controllers/ticketController.js';
// import upload from "../middleware/multer/multiUploadMulter.js"
const router = express.Router();

// router.post('/create', upload.array('images', 5), createTicket);
router.post('/create', createTicket);
router.get('/', getTickets);
router.get('/check-status/:orderId', checkOrderStatusAndTicketStatus);

export default router;

