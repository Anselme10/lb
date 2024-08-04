const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  id: { type: mongoose.Schema.Types.ObjectId },
  users: {
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
  },
  messages: [
    {
      id: { type: mongoose.Schema.Types.ObjectId },
      user: { type: String, required: true },
      content: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
