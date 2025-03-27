import { useState, useEffect } from "react";
import { Trophy, Award, Medal } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const Leaderboard = () => {
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get("/users/leaderboard");
        setPlayers(response.data);
      } catch (error) {
        toast.error("Failed to load leaderboard");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
    
    // Rafraîchir toutes les 5 minutes
    const interval = setInterval(fetchLeaderboard, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const rankIcon = (rank) => {
    switch (rank) {
      case 0:
        return <Trophy className="text-yellow-400 size-5" />;
      case 1:
        return <Award className="text-slate-400 size-5" />;
      case 2:
        return <Medal className="text-amber-600 size-5" />;
      default:
        return <span className="font-bold text-sm">{rank + 1}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-base-100 rounded-lg shadow-md overflow-hidden">
      <div className="bg-primary text-primary-content p-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Trophy className="size-5" /> Leaderboard
        </h2>
        <p className="text-sm opacity-80">Top players this week</p>
      </div>

      {players.length === 0 ? (
        <div className="p-6 text-center">
          <p>No players in the leaderboard yet.</p>
        </div>
      ) : (
        <div className="p-2">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-base-300">
                <th className="py-2 px-3 text-left text-sm font-medium">Rank</th>
                <th className="py-2 px-3 text-left text-sm font-medium">Player</th>
                <th className="py-2 px-3 text-left text-sm font-medium">Points</th>
                <th className="py-2 px-3 text-left text-sm font-medium">Games</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, index) => (
                <tr 
                  key={player._id} 
                  className={`border-b border-base-200 ${index < 3 ? 'bg-base-200' : ''}`}
                >
                  <td className="py-3 px-3">
                    <div className="flex justify-center items-center size-8 rounded-full bg-base-300">
                      {rankIcon(index)}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center">
                      <div className="size-8 mr-2">
                        <img 
                          src={player.profilePic || "/avatar.png"} 
                          alt={player.fullName} 
                          className="rounded-full size-8"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{player.fullName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-bold">{player.points}</td>
                  <td className="py-3 px-3">{player.gamesPlayed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Leaderboard; 