import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChallengeStore = create((set, get) => ({
  challenges: [],
  activeChallenge: null,
  leaderboard: [],
  isLoading: false,
  showChallengeModal: false,

  // Créer un nouveau défi
  createChallenge: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.post("/challenges/create");
      
      set({ 
        activeChallenge: res.data,
        showChallengeModal: true 
      });
      
      toast.success("Challenge created! Waiting for opponent...");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create challenge");
    } finally {
      set({ isLoading: false });
    }
  },

  // Démarrer un défi aléatoire entre deux utilisateurs en ligne
  startRandomChallenge: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.post("/challenges/start-random");
      
      toast.success("Random challenge started! Notifying participants...");
      
      // Le modal s'affichera automatiquement pour les utilisateurs sélectionnés
      // via l'événement socket "newChallenge"
      
      return res.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to start random challenge";
      toast.error(errorMessage);
      return { error: errorMessage };
    } finally {
      set({ isLoading: false });
    }
  },

  // Obtenir les défis actifs pour l'utilisateur
  getUserChallenges: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/challenges/user");
      set({ 
        challenges: res.data,
        activeChallenge: res.data.length > 0 ? res.data[0] : null
      });
    } catch (error) {
      toast.error("Failed to get challenges");
    } finally {
      set({ isLoading: false });
    }
  },

  // Obtenir le classement des joueurs
  getLeaderboard: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/users/leaderboard");
      set({ leaderboard: res.data });
    } catch (error) {
      toast.error("Failed to get leaderboard");
    } finally {
      set({ isLoading: false });
    }
  },

  // S'abonner aux événements de défi
  subscribeToChallenges: () => {
    const socket = useAuthStore.getState().socket;
    
    if (!socket) return;
    
    socket.on("newChallenge", (challengeData) => {
      set({ 
        activeChallenge: challengeData,
        showChallengeModal: true 
      });
      
      // Message différent selon qu'il s'agit d'un défi aléatoire ou normal
      if (challengeData.isRandomMatch) {
        toast.success("You've been selected for a random challenge!");
      } else {
        toast.success("You've been challenged by another player!");
      }
    });
    
    socket.on("challengeComplete", (result) => {
      // Mettre à jour les défis et le classement
      get().getUserChallenges();
      get().getLeaderboard();
      
      set({ showChallengeModal: false });
      
      if (result.isWinner) {
        toast.success(`Congratulations! You won ${result.points} points!`);
      } else {
        toast.error("Challenge lost. Better luck next time!");
      }
    });
  },
  
  // Se désabonner des événements
  unsubscribeFromChallenges: () => {
    const socket = useAuthStore.getState().socket;
    
    if (!socket) return;
    
    socket.off("newChallenge");
    socket.off("challengeComplete");
  },
  
  // Définir le défi actif
  setActiveChallenge: (challenge) => set({ activeChallenge: challenge }),
  
  // Contrôler la visibilité du modal de défi
  setShowChallengeModal: (show) => set({ showChallengeModal: show }),
  
  // Réinitialiser après la fin d'un défi
  resetChallenge: () => set({ 
    activeChallenge: null,
    showChallengeModal: false 
  })
})); 