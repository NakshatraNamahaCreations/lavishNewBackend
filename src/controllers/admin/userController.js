import User from '../../models/User.js';

// Get all users
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().sort({createdAt:-1});
        return res.status(200).json({
            success: true,
            totalcount: users.length,
            users: users
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching users",
            error: error.message
        });
    }
};


//get User Count
export const getUserCount = async (req, res) => {
    try {
        const totalCount = await User.countDocuments();
        console.log("Total number of documents:", totalCount);
        return res.status(200).json({
            success: true,
            count: totalCount
        })
    } catch (error) {
        console.log("Error", error)
        return res.status(500).json({
            success: false,
            message: "Failed to fetch User Count",
            error: error.message,
        });
    }
}


// Route to get users with pagination
export const getUsersWithPagination = async (req, res) => {
    console.log("hiii")
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const search = req.query.search || '';

        const skip = (page - 1) * limit;

        // Build search query
        const searchQuery = search ? {
            $or: [
                { email: { $regex: search, $options: 'i' } },
                { mobile: { $regex: search, $options: 'i' } }
            ]
        } : {};

        // Find users with pagination and search
        const users = await User.find(searchQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        
        console.log("users:", users)
        // Get the total count of filtered users
        const totalUsers = await User.countDocuments(searchQuery);

        // Send the response with users and pagination data
        return res.status(200).json({
            success: true,
            data: {
                users,
                pagination: {
                    totalUsers,
                    totalPages: Math.ceil(totalUsers / limit),
                    currentPage: page,
                    limit,
                    searchQuery: search
                }
            }
        });
    } catch (error) {
        // Handle error
        return res.status(500).json({
            success: false,
            message: "Error fetching users",
            error: error.message
        });
    }
};

// Get user by ID
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error("Error in getUserById:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching user",
            error: error.message
        });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        return res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error deleting user",
            error: error.message
        });
    }
}

export const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const { mobile, alternateMobile } = req.body;

        // Check if both mobile and alternateMobile are provided and valid
        if (!mobile || !alternateMobile) {
            return res.status(400).json({ message: "Mobile and alternate mobile numbers are required." });
        }

        if (isNaN(mobile) || isNaN(alternateMobile)) {
            return res.status(400).json({ message: "Mobile number must be a valid number." });
        }

        if ((mobile.length !== 10) || (alternateMobile.length !== 10)) {
            return res.status(400).json({ message: "Mobile numbers must be exactly 10 digits." });
        }

        const user = await User.findByIdAndUpdate(userId, req.body, { new: true });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            user: user
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({
            success: false,
            message: "Error updating user profile.",
            error: error.message
        });
    }
};


export const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }
        return res.status(200).json({
            success: true,
            user: user
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching user profile",
            error: error.message
        });
    }
}
