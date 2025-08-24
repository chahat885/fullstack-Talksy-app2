import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// @desc Get users for the sidebar
// @route GET /api/users
// @access Private
export const getUsersForSidebar = async (req, res) => {
  try {
    // Get the ID of the currently logged-in user
    const loggedInUserId = req.user._id;
    
    // Find all users except the one who is currently logged in.
    // Also, we don't want to expose the password, so we use .select("-password").
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    // Send the filtered users back to the client
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// @desc Get all messages between two users
// @route GET /api/messages/:id
// @access Private
export const getMessages = async (req, res) => {
  try {
    // Get the ID of the user we want to chat with from the URL parameters
    const { id: userToChatId } = req.params;
    // Get the ID of the current user from the request object
    const myId = req.user._id;

    // Find all messages where either the current user sent to the other,
    // or the other user sent to the current user.
    // The $or operator helps find documents that match either condition.
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    // Send the messages back to the client
    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// @desc Send a new message
// @route POST /api/messages/send/:id
// @access Private
export const sendMessage = async (req, res) => {
  try {
    // Get the message text and image (if any) from the request body
    const { text, image } = req.body;
    // Get the ID of the message recipient from the URL parameters
    const { id: receiverId } = req.params;
    // Get the ID of the message sender from the request object
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      // If an image is provided (as a Base64 string), upload it to Cloudinary.
      const uploadResponse = await cloudinary.uploader.upload(image);
      // Get the secure URL of the uploaded image.
      imageUrl = uploadResponse.secure_url;
    }

    // Create a new message document
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    // Save the new message to the database
    await newMessage.save();

    // Use a helper function to get the socket ID of the recipient
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      // If the recipient is online, emit a "newMessage" event to them in real-time
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    // Send the newly created message back to the client
    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// @desc Delete a message
// @route DELETE /api/messages/delete/:id
// @access Private
export const deleteMessage = async (req, res) => {
  try {
    // Get the message ID from the URL parameters
    const { id } = req.params;

    // Find the message by its ID and delete it from the database
    const deletedMsg = await Message.findByIdAndDelete(id);

    if (!deletedMsg) {
      // If the message wasn't found, return a 404 error
      return res.status(404).json({ message: "Message not found" });
    }

    // Send a success message along with the deleted message document
    res.status(200).json({ message: "Message deleted", deletedMsg });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
