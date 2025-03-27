import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    // Mettre à jour les messages non lus adressés à moi comme "seen"
    await Message.updateMany(
      { senderId: userToChatId, receiverId: myId, status: { $ne: "seen" } },
      { status: "seen" }
    );

    // Notifier l'expéditeur que ses messages ont été lus
    const receiverSocketId = getReceiverSocketId(userToChatId);
    if (receiverSocketId) {
      const updatedMessages = await Message.find({
        senderId: userToChatId, 
        receiverId: myId,
        status: "seen"
      });
      
      if (updatedMessages.length > 0) {
        io.to(receiverSocketId).emit("messagesRead", {
          messageIds: updatedMessages.map(msg => msg._id),
          chatPartnerId: myId
        });
      }
    }

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      status: "sent"
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
      // Mettre à jour le statut du message à "delivered" si le destinataire est en ligne
      newMessage.status = "delivered";
      await newMessage.save();
      
      // Informer l'expéditeur que le message a été livré
      const senderSocketId = getReceiverSocketId(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageDelivered", {
          messageId: newMessage._id,
          status: "delivered"
        });
      }
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Nouvelle fonction pour mettre à jour le statut d'un message
export const updateMessageStatus = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { status } = req.body;
    
    if (!["sent", "delivered", "seen"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }
    
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    
    // S'assurer que seul le destinataire peut marquer comme "seen"
    if (status === "seen" && message.receiverId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized to mark this message as seen" });
    }
    
    message.status = status;
    await message.save();
    
    // Notifier l'expéditeur du changement de statut
    const senderSocketId = getReceiverSocketId(message.senderId.toString());
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageStatusUpdate", {
        messageId: message._id,
        status
      });
    }
    
    res.status(200).json(message);
  } catch (error) {
    console.log("Error in updateMessageStatus controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Nouvelle fonction pour obtenir le nombre de messages non lus par utilisateur
export const getUnreadCounts = async (req, res) => {
  try {
    const myId = req.user._id;
    
    // Trouver tous les messages non lus adressés à l'utilisateur courant
    const unreadMessages = await Message.find({
      receiverId: myId,
      status: { $ne: "seen" }
    });
    
    // Compter les messages non lus par expéditeur
    const unreadCounts = {};
    
    unreadMessages.forEach(message => {
      const senderId = message.senderId.toString();
      unreadCounts[senderId] = (unreadCounts[senderId] || 0) + 1;
    });
    
    console.log("UNREAD COUNTS:", unreadCounts);
    res.status(200).json(unreadCounts);
  } catch (error) {
    console.log("Error in getUnreadCounts controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
