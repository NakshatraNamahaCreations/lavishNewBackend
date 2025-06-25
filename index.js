import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import orderRoutes from './src/routes/order/orderRoutes.js';


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/orders', orderRoutes);

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/lavishevents', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 