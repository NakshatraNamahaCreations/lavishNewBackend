import Enquiry from "../../models/enquiry/Enquiry.js";

export const submitInquiry = async (req, res) => {
    try {
        const { name, phone, email, service, message } = req.body;

        const enquiry = new Enquiry({
            name,
            phone,
            email,
            service,
            message
        });

        await enquiry.save();

        res.status(201).json({ success: true, message: "Inquiry submitted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};


// PATCH /api/enquiries/:id/status
// export const updateInquiryStatus = async (req, res) => {
//     const { id } = req.params;
//     const { status } = req.body;

//     try {
//         const updated = await Enquiry.findByIdAndUpdate(
//             id,
//             { status },
//             { new: true, runValidators: true }
//         );

//         if (!updated) {
//             return res.status(404).json({ success: false, message: "Inquiry not found" });
//         }

//         res.status(200).json({ success: true, data: updated });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: "Failed to update status",
//             error: error.message,
//         });
//     }
// };


export const getEnquiries = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';

        // Query to search by name and email only
        const query = search
            ? {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            }
            : {};

        const total = await Enquiry.countDocuments(query);  // Get the total number of records that match the search
        const enquiries = await Enquiry.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.status(200).json({
            success: true,
            data: {
                enquiries,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)  // Calculate total pages
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch enquiries",
            error: error.message
        });
    }
};
