import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, Heart, Film, Utensils, Book, Trophy, Target, Award } from "lucide-react";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  return (
    <div className="h-screen pt-20 overflow-y-auto pb-8">
      <div className="max-w-4xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Profile</h1>
            <p className="mt-2">Your profile information and game statistics</p>
          </div>

          {/* avatar upload section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || authUser.profilePic || "/avatar.png"}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4"
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                `}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Informations de base */}
            <div className="space-y-6">
              <h2 className="text-lg font-medium">Basic Information</h2>

              <div className="space-y-1.5">
                <div className="text-sm text-zinc-400 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </div>
                <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.fullName}</p>
              </div>

              <div className="space-y-1.5">
                <div className="text-sm text-zinc-400 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </div>
                <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.email}</p>
              </div>
            </div>

            {/* Préférences */}
            <div className="space-y-6">
              <h2 className="text-lg font-medium">Personal Preferences</h2>

              <div className="space-y-1.5">
                <div className="text-sm text-zinc-400 flex items-center gap-2">
                  <Film className="w-4 h-4" />
                  Favorite Series
                </div>
                <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.favoriteSeries || "Not specified"}</p>
              </div>

              <div className="space-y-1.5">
                <div className="text-sm text-zinc-400 flex items-center gap-2">
                  <Film className="w-4 h-4" />
                  Favorite Movie
                </div>
                <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.favoriteMovie || "Not specified"}</p>
              </div>

              <div className="space-y-1.5">
                <div className="text-sm text-zinc-400 flex items-center gap-2">
                  <Utensils className="w-4 h-4" />
                  Favorite Dish
                </div>
                <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.favoriteDish || "Not specified"}</p>
              </div>

              <div className="space-y-1.5">
                <div className="text-sm text-zinc-400 flex items-center gap-2">
                  <Book className="w-4 h-4" />
                  Favorite Hobby
                </div>
                <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.favoriteHobby || "Not specified"}</p>
              </div>
            </div>
          </div>

          {/* Statistiques de jeu */}
          <div className="mt-6 bg-base-200 rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Game Statistics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-base-300 p-4 rounded-lg text-center">
                <div className="text-primary text-3xl font-bold mb-2">{authUser?.points || 0}</div>
                <div className="text-sm text-zinc-400 flex items-center justify-center gap-1">
                  <Award className="w-4 h-4" />
                  Total Points
                </div>
              </div>
              
              <div className="bg-base-300 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold mb-2">{authUser?.gamesPlayed || 0}</div>
                <div className="text-sm text-zinc-400 flex items-center justify-center gap-1">
                  <Target className="w-4 h-4" />
                  Challenges Played
                </div>
              </div>
              
              <div className="bg-base-300 p-4 rounded-lg text-center">
                <div className="text-success text-3xl font-bold mb-2">{authUser?.gamesWon || 0}</div>
                <div className="text-sm text-zinc-400 flex items-center justify-center gap-1">
                  <Trophy className="w-4 h-4" />
                  Challenges Won
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-base-200 rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member Since</span>
                <span>{authUser.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Account Status</span>
                <span className="text-green-500">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProfilePage;
