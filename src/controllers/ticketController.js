import Ticket from "../models/Ticket.js"
import Order from "../models/order/Order.js"

export const createTicket = async (req, res) => {
    try {
        const { title, description, orderId, mobileNumber } = req.body;

        // const images = req.files.map(file => file.path);

        const ticket = new Ticket({
            title,
            description,
            orderId,
            mobileNumber,
            status: "raised",
        });

        await ticket.save();
        res.status(201).json({ success: true, ticket });
    } catch (error) {
        console.error('Error creating ticket:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

export const getTickets = async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const skip = (page - 1) * limit;

        // Build search query
        let query = {};
        if (search) {
            query = {
                $or: [
                    { orderId: { $regex: search, $options: 'i' } },
                    { mobileNumber: { $regex: search, $options: 'i' } }
                ]
            };
        }

        // Get total count for pagination
        const total = await Ticket.countDocuments(query);

        // Get paginated and filtered tickets
        const tickets = await Ticket.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        res.status(200).json({
            success: true,
            tickets,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error getting tickets:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const checkOrderStatusAndTicketStatus = async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: "Order ID is required"
            });
        }

        // First, check if the order exists and get its status
        const order = await Order.findOne({ orderId: orderId });
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Check if order status is completed
        const isOrderCompleted = order.orderStatus === "completed";

        // Find ticket for this order
        const ticket = await Ticket.findOne({ orderId: orderId });

        let ticketStatus = null;
        if (ticket) {
            ticketStatus = ticket.status;
        }

        return res.status(200).json({
            success: true,
            data: {
                orderId: orderId,
                orderStatus: order.orderStatus,
                isOrderCompleted: isOrderCompleted,
                ticketStatus: ticketStatus,
                hasTicket: !!ticket,
                order: {
                    orderId: order.orderId,
                    customerName: order.customerName,
                    eventDate: order.eventDate,
                    eventTime: order.eventTime,
                    orderStatus: order.orderStatus
                },
                ticket: ticket ? {
                    title: ticket.title,
                    description: ticket.description,
                    status: ticket.status,
                    createdAt: ticket.createdAt
                } : null
            }
        });

    } catch (error) {
        console.error('Error checking order and ticket status:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal Server Error',
            message: error.message 
        });
    }
};




