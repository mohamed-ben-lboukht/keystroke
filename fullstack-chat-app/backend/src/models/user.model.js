import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profilePic: {
      type: String,
      default: "",
    },
    // Informations personnelles légères
    favoriteSeries: {
      type: String,
      default: "",
    },
    favoriteDish: {
      type: String,
      default: "",
    },
    favoriteMovie: {
      type: String,
      default: "",
    },
    favoriteHobby: {
      type: String,
      default: "",
    },
    // Système de jeu
    points: {
      type: Number,
      default: 0,
    },
    gamesPlayed: {
      type: Number,
      default: 0,
    },
    gamesWon: {
      type: Number,
      default: 0,
    },
    inChallenge: {
      type: Boolean,
      default: false,
    },
    typingPattern: {
      type: String,
      default: "",
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
