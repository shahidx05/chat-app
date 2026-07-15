const Message = require('../models/message');

exports.getMessages = async (req, res) => {
    try {
        const myId = req.user.id;
        const { userId } = req.params;

        const messages = await Message.find({
            $or: [
                { sender: myId, receiver: userId },
                { sender: userId, receiver: myId }
            ]
        }).sort({ createdAt: 1 });

        res.status(200).json({
            success: true,
            messages
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
