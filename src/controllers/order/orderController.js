// controllers/orderController.js
import Order from "../../models/order/Order.js"
import Service from "../../models/serviceManagement/Service.js"
import moment from 'moment';


export const createOrder = async (req, res) => {
  try {
    console.log('Request Body:', req.body);
    console.log('Customer Details:', {
      name: req.body.customerName,
      id: req.body.customerId
    });

    const {
      orderId,
      eventDate,
      eventTime,
      pincode,
      balloonsColor,
      subTotal,
      grandTotal,
      paidAmount,
      dueAmount,
      deliveryCharges,
      couponDiscount,
      // gstAmount,
      // paymentType,
      address,
      customerName,
      customerId,
      items,
      addNote,
      occasion,
      decorLocation,
      otherOccasion,
      otherDecorLocation,
      source,
      slotExtraCharge
    } = req.body;

    // Validate required fields
    if (!orderId || !eventDate || !eventTime || !pincode || !subTotal ||
      !grandTotal || !paidAmount ||
      !address || !items || items.length === 0) {
      return res.status(400).json({
        message: 'Missing required fields',
        required: {
          orderId: !orderId,
          eventDate: !eventDate,
          eventTime: !eventTime,
          pincode: !pincode,
          subTotal: !subTotal,
          grandTotal: !grandTotal,
          paidAmount: !paidAmount,
          deliveryCharges: !deliveryCharges,
          address: !address,
          items: !items || items.length === 0
        }
      });
    }

    // Ensure each item has customizedInputs (default to empty array if not provided)
    const processedItems = items.map(item => ({
      ...item,
      customizedInputs: Array.isArray(item.customizedInputs) ? item.customizedInputs : []
    }));

    console.log('Creating order with customer details:', {
      customerName,
      customerId
    });

    const order = new Order({
      orderId,
      eventDate,
      eventTime,
      pincode,
      balloonsColor: balloonsColor || [],
      subTotal,
      grandTotal,
      paidAmount,
      dueAmount: dueAmount || 0,
      deliveryCharges,
      couponDiscount: couponDiscount || 0,
      // gstAmount,
      addNote,
      // paymentType: paymentType || 'full',
      address,
      items: processedItems,
      customerName: customerName,
      customerId: customerId,
      orderStatus: 'created',
      occasion,
      decorLocation,
      otherOccasion,
      otherDecorLocation,
      source,
      slotExtraCharge
    });

    console.log('Final order object:', order);

    const savedOrder = await order.save();
    console.log('Saved order:', savedOrder);

    res.status(201).json({
      success: true,
      data: savedOrder
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
};


export const getUserPastOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const now = moment();

    // Get all orders and filter manually based on combined datetime
    const allOrders = await Order.find({ customerId: userId });

    const pastOrders = allOrders.filter(order => {
      if (!order.eventDate || !order.eventTime) return false;

      // Combine eventDate and END time from eventTime range
      const [_, endTime] = order.eventTime.split(" - ");
      const combinedDateTime = moment(`${order.eventDate} ${endTime}`, "MMM DD, YYYY hh:mm A");

      return combinedDateTime.isBefore(now);
    });

    // Sort by eventDate descending
    pastOrders.sort((a, b) =>
      moment(b.eventDate, "MMM DD, YYYY").toDate() - moment(a.eventDate, "MMM DD, YYYY").toDate()
    );

    res.status(200).json({
      success: true,
      data: pastOrders,
      length: pastOrders.length,
    });
  } catch (error) {
    console.error("Error fetching past orders:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching past orders",
      error: error.message,
    });
  }
};



export const getUserUpcomingOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const now = moment();

    // Fetch all orders for the user
    const allOrders = await Order.find({ customerId: userId });

    // Filter only upcoming orders based on combined eventDate + endTime
    const upcomingOrders = allOrders.filter(order => {
      if (!order.eventDate || !order.eventTime) return false;

      const [_, endTime] = order.eventTime.split(" - ");
      const combinedDateTime = moment(
        `${order.eventDate} ${endTime}`,
        "MMM DD, YYYY hh:mm A"
      );

      return combinedDateTime.isSameOrAfter(now);
    });

    // ✅ Sort by createdAt DESC (most recently booked first)
    upcomingOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      success: true,
      data: upcomingOrders,
      length: upcomingOrders.length,
    });
  } catch (error) {
    console.error("Error fetching upcoming orders:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching upcoming orders",
      error: error.message,
    });
  }
};


export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const orders = await Order.find({ customerId: userId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const { status } = req.query
    const orders = await Order.find({ orderStatus: status }).sort({ createdAt: -1 });
    console.log("Orders", orders)
    res.json(orders);
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ message: 'Error fetching all orders', error: error.message });
  }
};

// length of the orders.
export const getOrdersCount = async (req, res) => {
  try {
    const orders = await Order.find();
    const total = orders.length;

    return res.status(200).json({
      success: true,
      total,
    });
  } catch (error) {
    console.error("Error counting orders:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to count orders",
      error: error.message,
    });
  }
};

// Controller for fetching orders by event date, with search and pagination
export const getOrdersByStatus = async (req, res) => {
  try {
    const { eventDate, search, page = 1, limit = 10, status } = req.query;

    if (!status) {
      return res.status(400).json({ message: 'Order status is required' });
    }

    if (status === 'created' && !eventDate) {
      return res.status(400).json({ message: 'Event date is required when status is "created"' });
    }


    const searchConditions = {
      $and: [
        // Apply eventDate only if the status is "created"
        ...(status === 'created' && eventDate ? [{ eventDate }] : []),

        // Filter by orderStatus based on the status passed in the query
        { orderStatus: status },

        // If there's a search term, apply the search condition
        ...(search ? [{
          $or: [
            { orderId: { $regex: search, $options: 'i' } },
            { customerName: { $regex: search, $options: 'i' } },
          ]
        }] : [])
      ]
    };


    const skip = (page - 1) * limit;

    const orders = await Order.find(searchConditions)
      .skip(skip)
      .limit(Number(limit))
      .sort({ eventTime: 1 });

    const totalOrders = await Order.countDocuments(searchConditions);
    const totalPages = Math.ceil(totalOrders / limit);

    res.json({
      orders,
      totalPages,
      currentPage: Number(page),
    });
  } catch (error) {
    console.error('Error fetching orders by event date:', error);
    res.status(500).json({ message: 'Error fetching orders by event date', error: error.message });
  }
};

// get ordersDetails by order id
export const getOrderDetailsbyId = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if id is provided
    if (!id) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    // Find order by ID and populate customer details with only alternateMobile and email
    const order = await Order.findOne({ _id: id })
      .populate('customerId', 'mobile alternateMobile email')


    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Return success response with order details
    return res.status(200).json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Error fetching order details:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching order details',
      error: error.message
    });
  }
};

//get Order Count
export const getOrderCount = async (req, res) => {
  try {
    const totalCount = await Order.countDocuments();
    console.log("Total number of documents:", totalCount);
    return res.status(200).json({
      success: true,
      count: totalCount
    })
  } catch (error) {
    console.log("Error", error)
    return res.status(500).json({
      success: false,
      message: "Failed to fetch Order Count",
      error: error.message,
    });
  }
}

// cancel order with id
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params
    const { reason } = req.body; // Assuming the reason comes from the request body
    const canceledDate = new Date(); // Set the current date as the canceled date

    // Validate input
    if (!id || !reason) {
      return res.status(400).json({ message: "Order ID and reason are required" });
    }

    // Find the order by ID
    const order = await Order.findOne({ _id: id });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update order status to 'canceled' and add reason and canceledDate
    order.orderStatus = "cancelled";
    order.reason = reason;
    order.canceledDate = canceledDate;

    // Save the updated order
    await order.save();

    return res.json({ message: "Order cancelled successfully", order });
  } catch (error) {
    console.error("Error canceling order:", error);
    res.status(500).json({ message: "Failed to cancel the order", error: error.message });
  }
};

export const rescheduleOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      rescheduledDate,
      rescheduledTime,
      rescheduledAddress,
      reason,
    } = req.body;

    // Validation: ID and reason must be provided, and at least one field (date/time/address)
    if (
      !id ||
      !reason ||
      (!rescheduledDate && !rescheduledTime && !rescheduledAddress)
    ) {
      return res.status(400).json({
        message:
          "Order ID, reason, and at least one of rescheduled date, time, or address are required.",
      });
    }

    // Find order
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update fields only if provided
    if (rescheduledDate) order.rescheduledEventDate = rescheduledDate;
    if (rescheduledTime) order.rescheduledEventTime = rescheduledTime;
    if (rescheduledAddress) order.rescheduledAddress = rescheduledAddress;

    order.reason = reason;
    order.orderStatus = "rescheduled";

    await order.save();

    return res.json({
      message: "Order rescheduled successfully",
      order,
    });
  } catch (error) {
    console.error("Error rescheduling order:", error);
    res
      .status(500)
      .json({ message: "Failed to reschedule the order", error: error.message });
  }
};

export const getRecentOrders = async (req, res) => {
  try {
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 }) // Sort by creation date in descending order
      .limit(6) // Limit to 10 most recent orders
      .populate('customerId', 'name email') // Populate customer details
      .populate('items.refId'); // Populate service/addon details

    if (!recentOrders.length) {
      return res.status(404).json({ message: "No orders found" });
    }


    return res.status(200).json({
      success: true,
      message: "Recent orders fetched successfully",
      orders: recentOrders
    });

  } catch (error) {
    console.error("Error fetching recent orders:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch recent orders",
      error: error.message
    });
  }
};



export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, reason, rescheduledDate, rescheduledTime, rescheduledAddress } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({
        success: false,
        message: "Order ID and status are required"
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Update order status
    order.orderStatus = status;

    if (status === "rescheduled") {
      if (reason) order.reason = reason;
      if (rescheduledDate) order.rescheduledEventDate = rescheduledDate;
      order.rescheduledEventTime = rescheduledTime ? rescheduledTime : order.eventTime;
      if (rescheduledAddress) order.rescheduledAddress = rescheduledAddress;
    } else if (status === "cancelled") {
      if (reason) order.reason = reason;
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order
    });

  } catch (error) {
    console.error("Error updating order status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message
    });
  }
};

export const getRecentOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    // Step 1: Get recent 5 orders (most recent first)
    const recentOrders = await Order.find({ customerId: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    if (!recentOrders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found for this user"
      });
    }

    const serviceItemList = [];

    // Step 2: Collect all service item data and refIds
    recentOrders.forEach(order => {
      order.items.forEach(item => {
        if (item.categoryType === 'Service' && item.refId) {
          serviceItemList.push({
            serviceId: item.refId,
            quantity: item.quantity,
            customizedInputs: item.customizedInputs,
            orderDate: order.createdAt,
            orderId: order.orderId,
          });
        }
      });
    });

    const uniqueServiceIds = [...new Set(serviceItemList.map(i => i.serviceId.toString()))];

    // Step 3: Fetch full service data
    const services = await Service.find({ _id: { $in: uniqueServiceIds } });

    // Step 4: Merge service info with order data
    const merged = serviceItemList.map(serviceItem => {
      const service = services.find(s => s._id.toString() === serviceItem.serviceId.toString());

      return {
        ...serviceItem,
        serviceDetails: service || null,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Recent service details fetched successfully",
      services: merged
    });

  } catch (error) {
    console.error("Error fetching recent service details:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch recent service details",
      error: error.message
    });
  }
};




// export const getUserUpcomingOrders = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const now = moment();

//     // Get all orders and filter manually based on combined datetime
//     const allOrders = await Order.find({ customerId: userId });

//     const upcomingOrders = allOrders.filter(order => {
//       if (!order.eventDate || !order.eventTime) return false;

//       // Combine eventDate and END time from eventTime range
//       const [_, endTime] = order.eventTime.split(" - ");
//       const combinedDateTime = moment(`${order.eventDate} ${endTime}`, "MMM DD, YYYY hh:mm A");

//       return combinedDateTime.isSameOrAfter(now);
//     });

//     // Sort by eventDate ascending
//     upcomingOrders.sort((a, b) =>
//       moment(a.eventDate, "MMM DD, YYYY").toDate() - moment(b.eventDate, "MMM DD, YYYY").toDate()
//     );

//     res.status(200).json({
//       success: true,
//       data: upcomingOrders,
//       length: upcomingOrders.length,
//     });
//   } catch (error) {
//     console.error("Error fetching upcoming orders:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching upcoming orders",
//       error: error.message,
//     });
//   }
// };






// export const updateOrderStatus = async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     const { status, reason } = req.body;

//     if (!orderId || !status) {
//       return res.status(400).json({
//         success: false,
//         message: "Order ID and status are required"
//       });
//     }

//     const order = await Order.findById(orderId);
//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found"
//       });
//     }

//     // Update order status
//     order.orderStatus = status;

//     // If status is cancelled, add reason
//     if (status === "cancelled" && reason) {
//       order.reason = reason;
//     }

//     await order.save();

//     return res.status(200).json({
//       success: true,
//       message: "Order status updated successfully",
//       order
//     });

//   } catch (error) {
//     console.error("Error updating order status:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to update order status",
//       error: error.message
//     });
//   }
// };
