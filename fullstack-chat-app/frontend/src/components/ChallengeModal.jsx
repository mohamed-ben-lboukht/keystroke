import { useState, useEffect } from "react";
import { Timer, X, UserCheck, UserX } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";

const ChallengeModal = ({ isOpen, onClose, challenge, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [opponentProfile, setOpponentProfile] = useState(null);
  const [guess, setGuess] = useState("");
  const { authUser } = useAuthStore();
  
  const isChallenger = challenge?.challenger === authUser._id;
  const opponentId = isChallenger ? challenge?.challenged : challenge?.challenger;

  useEffect(() => {
    if (!isOpen || !challenge) return;
    
    // Récupérer le profil de l'adversaire
    const fetchOpponentProfile = async () => {
      try {
        const response = await axiosInstance.get(`/users/profile/${opponentId}`);
        setOpponentProfile(response.data);
      } catch (error) {
        toast.error("Failed to load opponent profile");
      }
    };
    
    fetchOpponentProfile();
    
    // Initialiser le timer
    const endTime = new Date(challenge.endTime).getTime();
    const now = new Date().getTime();
    const initialTimeLeft = Math.max(0, Math.floor((endTime - now) / 1000));
    setTimeLeft(initialTimeLeft);
    
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          submitGuess("timeout");
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isOpen, challenge, opponentId]);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const submitGuess = async (result) => {
    if (!challenge) return;
    
    try {
      const isReal = result === "real" || result === "timeout" ? true : false;
      await axiosInstance.post(`/challenges/submit-guess/${challenge._id}`, {
        isReal,
        isChallenger
      });
      
      toast.success("Your guess has been submitted!");
      onComplete && onComplete();
    } catch (error) {
      toast.error("Failed to submit your guess");
    }
  };
  
  if (!isOpen || !challenge || !opponentProfile) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-lg shadow-lg max-w-md w-full">
        <div className="p-4 border-b flex justify-between items-center bg-primary text-primary-content rounded-t-lg">
          <h2 className="text-xl font-bold">Profile Challenge</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X className="size-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2 bg-warning/20 text-warning-content px-4 py-2 rounded-full">
              <Timer className="size-5" />
              <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
            </div>
          </div>
          
          <div className="flex flex-col items-center mb-6">
            <div className="size-24 mb-4">
              <img 
                src={opponentProfile.profilePic || "/avatar.png"} 
                alt="Opponent" 
                className="rounded-full object-cover w-full h-full border-4 border-primary" 
              />
            </div>
            <h3 className="text-xl font-bold mb-1">{opponentProfile.fullName}</h3>
          </div>
          
          <div className="space-y-3 mb-6">
            <div className="bg-base-200 p-3 rounded-lg">
              <span className="font-semibold block">Favorite Series:</span>
              <span>{opponentProfile.favoriteSeries}</span>
            </div>
            <div className="bg-base-200 p-3 rounded-lg">
              <span className="font-semibold block">Favorite Movie:</span>
              <span>{opponentProfile.favoriteMovie}</span>
            </div>
            <div className="bg-base-200 p-3 rounded-lg">
              <span className="font-semibold block">Favorite Dish:</span>
              <span>{opponentProfile.favoriteDish}</span>
            </div>
            <div className="bg-base-200 p-3 rounded-lg">
              <span className="font-semibold block">Favorite Hobby:</span>
              <span>{opponentProfile.favoriteHobby}</span>
            </div>
          </div>
          
          <div className="text-center space-y-3">
            <p className="font-medium text-lg">Is this profile real or fake?</p>
            <div className="flex justify-center gap-3">
              <button 
                className="btn btn-success gap-2"
                onClick={() => submitGuess("real")}
              >
                <UserCheck className="size-5" />
                Real Profile
              </button>
              <button 
                className="btn btn-error gap-2"
                onClick={() => submitGuess("fake")}
              >
                <UserX className="size-5" />
                Fake Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeModal; 