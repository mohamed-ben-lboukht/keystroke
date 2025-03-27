import mongoose from "mongoose";

const challengeSchema = new mongoose.Schema(
  {
    challenger: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    challenged: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    challengerGuessedCorrectly: {
      type: Boolean,
      default: false,
    },
    challengedGuessedCorrectly: {
      type: Boolean,
      default: false,
    },
    // Pour stocker les échanges spécifiques au défi
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
  },
  { timestamps: true }
);

const Challenge = mongoose.model("Challenge", challengeSchema);

export default Challenge; 