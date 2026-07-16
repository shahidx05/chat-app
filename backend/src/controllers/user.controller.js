const User = require('../models/User');

exports.getUsers = async (req, res) => {
    try {
        const { id } = req.user;

        const users = await User.find({
            _id: { $ne: id }
        }).select("-password");
        res.status(200).json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
