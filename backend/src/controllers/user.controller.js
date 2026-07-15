const User = require('../models/User');

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({ _id: { $ne: req.userId } }).select('-password')
        res.status(200).json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
