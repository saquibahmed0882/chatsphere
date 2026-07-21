const Message = require("../models/Message");

const socket = require("../socket");

exports.getMessages = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ],
      deletedForEveryone: { $ne: true },
      deletedFor: { $nin: [senderId] }
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteForEveryone = async (req, res) => {
  try {

    const io = socket.getIO();

    const { messageId } = req.body;

    console.log("DELETE REQUEST:", messageId);

    const updated = await Message.findByIdAndUpdate(
      messageId,
      {
        deletedForEveryone: true,
        text: "This message was deleted",
      },
      { new: true }
    );

    console.log("UPDATED MESSAGE:", updated);

    if(updated){
 
      console.log("🔥 EMITTING DELETE");

        io.to(updated.receiver.toString()).emit(
          "messageDeleted",
          updated
        );
        
        io.to(updated.sender.toString()).emit(
          "messageDeleted",
          updated
        );

    }

    res.json({
      success: true, 
      message: "Deleted for everyone", 
      updated
    });
          

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteForMe = async (req, res) => {
  try {

    const { messageId, userId } = req.body;

    console.log("🔥 DELETE FOR ME REQUEST:", messageId, userId);

    const updated = await Message.findByIdAndUpdate(
      messageId,
      {
        $addToSet: { deletedFor: userId }
      },
      { new: true }
    );

    console.log("🔥 UPDATED DELETE FOR ME:", updated);

    res.json({
      success: true,
      message: "Deleted for me",
      updated
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
