import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  unreadMessages: {}, // Map des utilisateurs avec des messages non lus: { userId: count }

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
      
      // Initialiser les messages non lus pour chaque utilisateur
      get().initializeUnreadMessages();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  initializeUnreadMessages: async () => {
    try {
      console.log("INITIALIZING UNREAD MESSAGES");
      const res = await axiosInstance.get("/messages/unread-counts");
      console.log("UNREAD COUNTS FROM SERVER:", res.data);
      set({ unreadMessages: res.data });
    } catch (error) {
      console.error("Error fetching unread message counts:", error);
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
      
      // Marquer les messages comme lus pour cet utilisateur
      if (userId) {
        const { unreadMessages } = get();
        const updatedUnreadMessages = { ...unreadMessages };
        delete updatedUnreadMessages[userId]; // Supprime le compteur pour cet utilisateur
        set({ unreadMessages: updatedUnreadMessages });
      }
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
      return res.data; // Retourne le message pour traiter son ID et statut
    } catch (error) {
      toast.error(error.response.data.message);
      return null;
    }
  },

  updateMessageStatus: async (messageId, status) => {
    try {
      await axiosInstance.patch(`/messages/status/${messageId}`, { status });
      
      const { messages } = get();
      const updatedMessages = messages.map(message => 
        message._id === messageId ? { ...message, status } : message
      );
      
      set({ messages: updatedMessages });
    } catch (error) {
      console.error("Error updating message status:", error);
    }
  },

  // Ajouter un message non lu pour un utilisateur
  addUnreadMessage: (userId) => {
    const { unreadMessages } = get();
    console.log("ADDING UNREAD MESSAGE, CURRENT COUNT:", unreadMessages[userId] || 0);
    const currentCount = unreadMessages[userId] || 0;
    set({
      unreadMessages: {
        ...unreadMessages,
        [userId]: currentCount + 1
      }
    });
    console.log("UNREAD MESSAGES AFTER ADD:", {
      ...unreadMessages,
      [userId]: currentCount + 1
    });
  },

  // Marquer tous les messages d'un utilisateur comme lus
  markMessagesAsRead: (userId) => {
    const { unreadMessages } = get();
    const updatedUnreadMessages = { ...unreadMessages };
    delete updatedUnreadMessages[userId];
    set({ unreadMessages: updatedUnreadMessages });
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      console.log("NEW MESSAGE RECEIVED:", newMessage);
      console.log("CURRENT SELECTED USER:", selectedUser);
      console.log("IS USER SELECTED:", selectedUser && newMessage.senderId === selectedUser._id);
      
      // Si le message vient de l'utilisateur sélectionné
      const isMessageSentFromSelectedUser = selectedUser && newMessage.senderId === selectedUser._id;
      
      if (isMessageSentFromSelectedUser) {
        // Ajouter le message à la conversation et le marquer comme vu
        console.log("ADDING MESSAGE TO SELECTED CONVERSATION");
        set({
          messages: [...get().messages, newMessage],
        });
        
        // Mettre à jour automatiquement le statut à "seen" quand on reçoit un message 
        // et qu'on est dans la conversation avec l'expéditeur
        get().updateMessageStatus(newMessage._id, "seen");
      } else if (newMessage.receiverId === useAuthStore.getState().authUser._id) {
        // Si le message est adressé à l'utilisateur actuel mais pas de l'utilisateur actuellement sélectionné
        // Augmenter le compteur de messages non lus
        console.log("ADDING UNREAD MESSAGE FOR USER:", newMessage.senderId);
        get().addUnreadMessage(newMessage.senderId);
        console.log("UNREAD MESSAGES AFTER UPDATE:", get().unreadMessages);
      }
    });
    
    // Gérer les mises à jour de statut des messages
    socket.on("messageDelivered", ({ messageId, status }) => {
      const { messages } = get();
      const updatedMessages = messages.map(message => 
        message._id === messageId ? { ...message, status } : message
      );
      
      set({ messages: updatedMessages });
    });
    
    socket.on("messageStatusUpdate", ({ messageId, status }) => {
      const { messages } = get();
      const updatedMessages = messages.map(message => 
        message._id === messageId ? { ...message, status } : message
      );
      
      set({ messages: updatedMessages });
    });
    
    socket.on("messagesRead", ({ messageIds, chatPartnerId }) => {
      const { selectedUser, messages } = get();
      
      // N'appliquer la mise à jour que si les messages lus proviennent de l'utilisateur actuellement sélectionné
      if (selectedUser && selectedUser._id === chatPartnerId) {
        const updatedMessages = messages.map(message => 
          messageIds.includes(message._id) ? { ...message, status: "seen" } : message
        );
        
        set({ messages: updatedMessages });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("messageDelivered");
    socket.off("messageStatusUpdate");
    socket.off("messagesRead");
  },

  setSelectedUser: (selectedUser) => {
    console.log("SETTING SELECTED USER:", selectedUser);
    // Quand on sélectionne un utilisateur, marquer ses messages comme lus
    if (selectedUser) {
      console.log("MARKING MESSAGES AS READ FOR:", selectedUser._id);
      console.log("UNREAD MESSAGES BEFORE:", get().unreadMessages);
      get().markMessagesAsRead(selectedUser._id);
      console.log("UNREAD MESSAGES AFTER:", get().unreadMessages);
    }
    set({ selectedUser });
  },
}));
