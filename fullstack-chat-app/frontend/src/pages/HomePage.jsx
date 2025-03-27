import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useChallengeStore } from "../store/useChallengeStore";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import Leaderboard from "../components/Leaderboard";
import ChallengeModal from "../components/ChallengeModal";
import { AlertCircle, Target, RefreshCw } from "lucide-react";

const HomePage = () => {
  const { selectedUser } = useChatStore();
  const { authUser } = useAuthStore();
  const { 
    activeChallenge, 
    showChallengeModal, 
    setShowChallengeModal, 
    resetChallenge,
    subscribeToChallenges,
    unsubscribeFromChallenges,
    createChallenge
  } = useChallengeStore();
  const [isChallengeLoading, setIsChallengeLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // S'abonner aux événements de défi
    subscribeToChallenges();
    
    return () => {
      unsubscribeFromChallenges();
    };
  }, [subscribeToChallenges, unsubscribeFromChallenges]);

  // Effacer le message d'erreur après un certain temps
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("");
      }, 10000); // 10 secondes
      
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Gérer la fin d'un défi
  const handleChallengeComplete = () => {
    resetChallenge();
  };
  
  // Gérer le démarrage d'un défi
  const handleStartChallenge = async () => {
    if (isChallengeLoading) return;
    
    setIsChallengeLoading(true);
    setErrorMessage("");
    
    try {
      await createChallenge();
      console.log("Challenge created successfully");
    } catch (error) {
      console.error("Error creating challenge:", error);
      
      // Extraire le message d'erreur de la réponse
      const errorMsg = error.response?.data?.message || "Failed to create challenge";
      setErrorMessage(errorMsg);
      
      // Afficher un toast avec le message d'erreur approprié
      if (errorMsg.includes("No other users available")) {
        toast.error("There are no other users in the system. Invite friends to join!");
      } else if (errorMsg.includes("All users are currently in challenges")) {
        toast.error("All users are busy in challenges. Please try again in a few minutes.");
      } else if (errorMsg.includes("No online users available")) {
        toast.error("No other users are currently online. Try again later.");
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setIsChallengeLoading(false);
    }
  };

  // Fonction pour afficher un message d'erreur convivial
  const getFriendlyErrorMessage = () => {
    if (errorMessage.includes("No other users available")) {
      return "There are no other users registered in the system. Invite friends to join!";
    } else if (errorMessage.includes("All users are currently in challenges")) {
      return "All users are currently busy in challenges. Please try again in a few minutes.";
    } else if (errorMessage.includes("No online users available")) {
      return "No other users are currently online. Try again later.";
    } else {
      return errorMessage;
    }
  };

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-start justify-center pt-20 px-4 gap-4">
        {/* Section principale de chat */}
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />
            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>
        </div>
        
        {/* Colonne de droite avec leaderboard et bouton de défi */}
        <div className="hidden lg:flex flex-col w-80 gap-4">
          <div className="bg-base-100 rounded-lg shadow-md p-4 space-y-4">
            <button 
              className="btn btn-primary w-full gap-2" 
              onClick={handleStartChallenge}
              disabled={isChallengeLoading}
            >
              {isChallengeLoading ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Creating Challenge...
                </>
              ) : (
                <>
                  <Target className="size-5" />
                  Start a Challenge
                </>
              )}
            </button>
            
            {errorMessage && (
              <div className="text-error text-sm text-center mt-2 bg-error/10 p-3 rounded-md flex flex-col gap-2">
                <div className="flex items-center justify-center gap-2">
                  <AlertCircle className="size-4" />
                  <span className="font-medium">Challenge Error</span>
                </div>
                <p>{getFriendlyErrorMessage()}</p>
                <button 
                  className="btn btn-xs btn-outline mt-1"
                  onClick={() => setErrorMessage("")}
                >
                  <RefreshCw className="size-3 mr-1" />
                  Dismiss
                </button>
              </div>
            )}
            
            <p className="text-xs text-center mt-2 text-base-content/60">
              Challenge a random user and test your profiling skills!
            </p>
          </div>
          
          <Leaderboard />
        </div>
      </div>
      
      {/* Modal de défi */}
      {activeChallenge && (
        <ChallengeModal
          isOpen={showChallengeModal}
          onClose={() => setShowChallengeModal(false)}
          challenge={activeChallenge}
          onComplete={handleChallengeComplete}
        />
      )}
    </div>
  );
};
export default HomePage;

