import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { 
  Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, User, Heart, Film, 
  Utensils, Trophy, Tv, Music, BookOpen, Check, ChevronLeft, ChevronRight, 
  Camera, Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import AuthImagePattern from "../components/AuthImagePattern";
import toast from "react-hot-toast";

// Données prédéfinies pour les options
const MOVIE_OPTIONS = [
  "Avengers", "Star Wars", "The Godfather", "Pulp Fiction", "Inception", 
  "The Dark Knight", "Fight Club", "The Matrix", "Forrest Gump", "Titanic",
  "Jurassic Park", "Avatar", "The Lion King", "Interstellar", "Parasite"
];

const SERIES_OPTIONS = [
  "Game of Thrones", "Breaking Bad", "Stranger Things", "The Office", "Friends",
  "The Crown", "Black Mirror", "The Mandalorian", "Squid Game", "The Witcher",
  "Money Heist", "Dark", "Peaky Blinders", "The Queen's Gambit", "Euphoria"
];

const FOOTBALL_TEAMS = [
  "FC Barcelona", "Real Madrid", "Manchester United", "Liverpool", "Bayern Munich",
  "Paris Saint-Germain", "Juventus", "Manchester City", "Chelsea", "Arsenal",
  "AC Milan", "Inter Milan", "Borussia Dortmund", "Atlético Madrid", "Tottenham Hotspur"
];

const FOOD_OPTIONS = [
  "Pizza", "Sushi", "Burger", "Pasta", "Tacos", "Steak", "Curry", "Ramen",
  "Paella", "Lasagna", "Pho", "Kebab", "Dim Sum", "Baguette", "Croissant"
];

const HOBBY_OPTIONS = [
  "Reading", "Traveling", "Photography", "Cooking", "Gaming", "Hiking",
  "Swimming", "Painting", "Dancing", "Gardening", "Yoga", "Playing guitar",
  "Biking", "Chess", "Singing"
];

const SignUpPage = () => {
  // État pour le formulaire multi-étapes
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  
  // Données du formulaire
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    favoriteSeries: "",
    favoriteMovie: "",
    favoriteDish: "",
    favoriteHobby: "",
    footballTeam: "",
    profilePic: ""
  });

  const { signup, isSigningUp } = useAuthStore();
  
  // Options sélectionnées
  const [selectedMovies, setSelectedMovies] = useState([]);
  const [selectedSeries, setSelectedSeries] = useState([]);
  const [selectedFood, setSelectedFood] = useState([]);
  const [selectedHobbies, setSelectedHobbies] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");

  // Gestion des avatars - Remplacer par des avatars en ligne
  const avatars = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Jasper",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Midnight",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Oreo"
  ];

  // Validation du formulaire
  const validateCurrentStep = () => {
    switch (step) {
      case 1:
        if (!formData.fullName.trim()) return toast.error("Full name is required");
        if (!formData.email.trim()) return toast.error("Email is required");
        if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
        if (!formData.password) return toast.error("Password is required");
        if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");
        return true;
      case 2:
        if (selectedMovies.length === 0) return toast.error("Please select at least one favorite movie");
        if (selectedSeries.length === 0) return toast.error("Please select at least one favorite series");
        return true;
      case 3:
        if (selectedFood.length === 0) return toast.error("Please select at least one favorite food");
        if (selectedHobbies.length === 0) return toast.error("Please select at least one hobby");
        return true;
      case 4:
        if (!selectedTeam) return toast.error("Please select your favorite football team");
        return true;
      case 5:
        return true;
      default:
        return true;
    }
  };

  // Navigation entre les étapes
  const nextStep = () => {
    if (validateCurrentStep()) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  // Gestionnaires pour les sélections multiples
  const toggleMovieSelection = (movie) => {
    if (selectedMovies.includes(movie)) {
      setSelectedMovies(selectedMovies.filter(m => m !== movie));
    } else {
      if (selectedMovies.length < 3) {
        setSelectedMovies([...selectedMovies, movie]);
      } else {
        toast.error("You can select up to 3 favorite movies");
      }
    }
  };

  const toggleSeriesSelection = (series) => {
    if (selectedSeries.includes(series)) {
      setSelectedSeries(selectedSeries.filter(s => s !== series));
    } else {
      if (selectedSeries.length < 3) {
        setSelectedSeries([...selectedSeries, series]);
      } else {
        toast.error("You can select up to 3 favorite series");
      }
    }
  };

  const toggleFoodSelection = (food) => {
    if (selectedFood.includes(food)) {
      setSelectedFood(selectedFood.filter(f => f !== food));
    } else {
      if (selectedFood.length < 3) {
        setSelectedFood([...selectedFood, food]);
      } else {
        toast.error("You can select up to 3 favorite foods");
      }
    }
  };

  const toggleHobbySelection = (hobby) => {
    if (selectedHobbies.includes(hobby)) {
      setSelectedHobbies(selectedHobbies.filter(h => h !== hobby));
    } else {
      if (selectedHobbies.length < 3) {
        setSelectedHobbies([...selectedHobbies, hobby]);
      } else {
        toast.error("You can select up to 3 favorite hobbies");
      }
    }
  };

  // Soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Préparation des données finales
    const dataToSubmit = {
      ...formData,
      favoriteSeries: selectedSeries.join(", "),
      favoriteMovie: selectedMovies.join(", "),
      favoriteDish: selectedFood.join(", "),
      favoriteHobby: selectedHobbies.join(", "),
      footballTeam: selectedTeam,
      profilePic: avatars[selectedAvatar]
    };

    // Afficher toast de confirmation avant envoi
    toast.success("Creating your account with your chosen avatar...");
    
    // Délai pour donner le temps à l'utilisateur de voir l'avatar sélectionné
    setTimeout(() => {
      // Envoyer au serveur
      signup(dataToSubmit);
    }, 1000);
  };

  // Rendu des étapes
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <div className="text-center mb-8">
              <div className="flex flex-col items-center gap-2 group">
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <User className="size-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold mt-2">Create Your Account</h1>
                <p className="text-base-content/60">Step 1: Basic Information</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Full Name</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="size-5 text-base-content/40" />
                  </div>
                  <input
                    type="text"
                    className="input input-bordered w-full pl-10"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Email</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="size-5 text-base-content/40" />
                  </div>
                  <input
                    type="email"
                    className="input input-bordered w-full pl-10"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Password</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="size-5 text-base-content/40" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="input input-bordered w-full pl-10"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="size-5 text-base-content/40" />
                    ) : (
                      <Eye className="size-5 text-base-content/40" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                className="btn btn-primary gap-2"
                onClick={nextStep}
              >
                Next Step
                <ChevronRight className="size-4" />
              </button>
            </div>
          </>
        );

      case 2:
        return (
          <>
            <div className="text-center mb-8">
              <div className="flex flex-col items-center gap-2 group">
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Film className="size-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold mt-2">Your Entertainment Preferences</h1>
                <p className="text-base-content/60">Step 2: Select your favorite movies and series</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="label">
                  <span className="label-text font-medium flex items-center gap-2">
                    <Film className="size-4" />
                    Select your favorite movies (up to 3)
                  </span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {MOVIE_OPTIONS.map((movie) => (
                    <div
                      key={movie}
                      className={`cursor-pointer p-2 rounded-lg border ${
                        selectedMovies.includes(movie)
                          ? "bg-primary/20 border-primary"
                          : "bg-base-200 border-transparent"
                      }`}
                      onClick={() => toggleMovieSelection(movie)}
                    >
                      <div className="flex items-center gap-2">
                        {selectedMovies.includes(movie) && (
                          <Check className="size-4 text-primary" />
                        )}
                        <span className={selectedMovies.includes(movie) ? "font-medium" : ""}>
                          {movie}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium flex items-center gap-2">
                    <Tv className="size-4" />
                    Select your favorite series (up to 3)
                  </span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {SERIES_OPTIONS.map((series) => (
                    <div
                      key={series}
                      className={`cursor-pointer p-2 rounded-lg border ${
                        selectedSeries.includes(series)
                          ? "bg-primary/20 border-primary"
                          : "bg-base-200 border-transparent"
                      }`}
                      onClick={() => toggleSeriesSelection(series)}
                    >
                      <div className="flex items-center gap-2">
                        {selectedSeries.includes(series) && (
                          <Check className="size-4 text-primary" />
                        )}
                        <span className={selectedSeries.includes(series) ? "font-medium" : ""}>
                          {series}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                type="button"
                className="btn btn-outline gap-2"
                onClick={prevStep}
              >
                <ChevronLeft className="size-4" />
                Previous
              </button>
              <button
                type="button"
                className="btn btn-primary gap-2"
                onClick={nextStep}
              >
                Next Step
                <ChevronRight className="size-4" />
              </button>
            </div>
          </>
        );

      case 3:
        return (
          <>
            <div className="text-center mb-8">
              <div className="flex flex-col items-center gap-2 group">
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Utensils className="size-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold mt-2">Your Lifestyle</h1>
                <p className="text-base-content/60">Step 3: Food and hobbies</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="label">
                  <span className="label-text font-medium flex items-center gap-2">
                    <Utensils className="size-4" />
                    Select your favorite foods (up to 3)
                  </span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {FOOD_OPTIONS.map((food) => (
                    <div
                      key={food}
                      className={`cursor-pointer p-2 rounded-lg border ${
                        selectedFood.includes(food)
                          ? "bg-primary/20 border-primary"
                          : "bg-base-200 border-transparent"
                      }`}
                      onClick={() => toggleFoodSelection(food)}
                    >
                      <div className="flex items-center gap-2">
                        {selectedFood.includes(food) && (
                          <Check className="size-4 text-primary" />
                        )}
                        <span className={selectedFood.includes(food) ? "font-medium" : ""}>
                          {food}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium flex items-center gap-2">
                    <BookOpen className="size-4" />
                    Select your favorite hobbies (up to 3)
                  </span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {HOBBY_OPTIONS.map((hobby) => (
                    <div
                      key={hobby}
                      className={`cursor-pointer p-2 rounded-lg border ${
                        selectedHobbies.includes(hobby)
                          ? "bg-primary/20 border-primary"
                          : "bg-base-200 border-transparent"
                      }`}
                      onClick={() => toggleHobbySelection(hobby)}
                    >
                      <div className="flex items-center gap-2">
                        {selectedHobbies.includes(hobby) && (
                          <Check className="size-4 text-primary" />
                        )}
                        <span className={selectedHobbies.includes(hobby) ? "font-medium" : ""}>
                          {hobby}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                type="button"
                className="btn btn-outline gap-2"
                onClick={prevStep}
              >
                <ChevronLeft className="size-4" />
                Previous
              </button>
              <button
                type="button"
                className="btn btn-primary gap-2"
                onClick={nextStep}
              >
                Next Step
                <ChevronRight className="size-4" />
              </button>
            </div>
          </>
        );

      case 4:
        return (
          <>
            <div className="text-center mb-8">
              <div className="flex flex-col items-center gap-2 group">
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Trophy className="size-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold mt-2">Sports Fan?</h1>
                <p className="text-base-content/60">Step 4: Your football team</p>
              </div>
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <Trophy className="size-4" />
                  Select your favorite football team
                </span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {FOOTBALL_TEAMS.map((team) => (
                  <div
                    key={team}
                    className={`cursor-pointer p-3 rounded-lg border ${
                      selectedTeam === team
                        ? "bg-primary/20 border-primary"
                        : "bg-base-200 border-transparent"
                    }`}
                    onClick={() => setSelectedTeam(team)}
                  >
                    <div className="flex items-center gap-2">
                      {selectedTeam === team && (
                        <Check className="size-4 text-primary" />
                      )}
                      <span className={selectedTeam === team ? "font-medium" : ""}>
                        {team}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                type="button"
                className="btn btn-outline gap-2"
                onClick={prevStep}
              >
                <ChevronLeft className="size-4" />
                Previous
              </button>
              <button
                type="button"
                className="btn btn-primary gap-2"
                onClick={nextStep}
              >
                Next Step
                <ChevronRight className="size-4" />
              </button>
            </div>
          </>
        );

      case 5:
        return (
          <>
            <div className="text-center mb-8">
              <div className="flex flex-col items-center gap-2 group">
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Camera className="size-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold mt-2">Choose Your Avatar</h1>
                <p className="text-base-content/60">Final step: Select an avatar</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-3 mt-2">
                {avatars.map((avatar, index) => (
                  <div
                    key={index}
                    className={`cursor-pointer p-2 rounded-lg ${
                      selectedAvatar === index ? "bg-primary/20 border-2 border-primary" : "bg-base-200"
                    }`}
                    onClick={() => {
                      setSelectedAvatar(index);
                      toast.success(`Avatar ${index + 1} selected!`);
                    }}
                  >
                    <img
                      src={avatar}
                      alt={`Avatar ${index + 1}`}
                      className="w-full h-auto rounded-lg"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback";
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="bg-base-200 p-4 rounded-lg mt-6">
                <h3 className="font-medium flex items-center gap-2 mb-3">
                  <Sparkles className="size-5 text-primary" />
                  Profile Preview
                </h3>
                <div className="flex flex-col md:flex-row items-start gap-4">
                  <div className="size-24">
                    <img
                      src={avatars[selectedAvatar]}
                      alt="Selected Avatar"
                      className="rounded-full size-24 object-cover border-4 border-primary"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback";
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {formData.fullName}</p>
                    <p><span className="font-medium">Movies:</span> {selectedMovies.join(", ")}</p>
                    <p><span className="font-medium">Series:</span> {selectedSeries.join(", ")}</p>
                    <p><span className="font-medium">Food:</span> {selectedFood.join(", ")}</p>
                    <p><span className="font-medium">Hobbies:</span> {selectedHobbies.join(", ")}</p>
                    <p><span className="font-medium">Football Team:</span> {selectedTeam}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                type="button"
                className="btn btn-outline gap-2"
                onClick={prevStep}
              >
                <ChevronLeft className="size-4" />
                Previous
              </button>
              <button
                type="button"
                className="btn btn-primary gap-2" 
                disabled={isSigningUp}
                onClick={handleSubmit}
              >
                {isSigningUp ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="size-4" />
                    Create Account
                  </>
                )}
              </button>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  // Indicateur de progression
  const renderProgressBar = () => {
    return (
      <div className="w-full mb-8">
        <div className="flex justify-between mb-2">
          {[1, 2, 3, 4, 5].map((stepNumber) => (
            <div
              key={stepNumber}
              className={`size-8 rounded-full flex items-center justify-center ${
                step >= stepNumber ? "bg-primary text-primary-content" : "bg-base-300"
              }`}
            >
              {stepNumber}
            </div>
          ))}
        </div>
        <div className="w-full bg-base-300 h-2 rounded-full">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((step - 1) / 4) * 100}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* left side */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          <div className="flex flex-col items-center">
            <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <MessageSquare className="size-6 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-center">Join Our Community</h2>
          </div>

          {renderProgressBar()}

          <form onSubmit={handleSubmit} className="space-y-6">
            {renderStep()}
          </form>

          <div className="text-center">
            <p className="text-base-content/60">
              Already have an account?{" "}
              <Link to="/login" className="link link-primary">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* right side */}
      <AuthImagePattern
        title="Discover New Connections"
        subtitle="Share your interests, join challenges, and connect with like-minded people who share your passions."
      />
    </div>
  );
};

export default SignUpPage;
