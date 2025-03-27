import Challenge from "../models/challenge.model.js";
import User from "../models/user.model.js";
import { getRandomUsers } from "../lib/utils.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// Créer un nouveau défi
export const createChallenge = async (req, res) => {
  try {
    const challenger = req.user._id;
    
    // Trouver un utilisateur aléatoire disponible pour le défi
    const allUsers = await User.find({ 
      _id: { $ne: challenger }
    });
    
    if (allUsers.length === 0) {
      return res.status(400).json({ message: "No other users available for challenge" });
    }
    
    // Filtrer les utilisateurs qui ne sont pas en défi (si possible)
    let availableUsers = allUsers.filter(user => !user.inChallenge);
    
    // Si aucun utilisateur n'est disponible, utilisez tous les utilisateurs en dernier recours
    // ou renvoyez un message d'erreur plus précis
    if (availableUsers.length === 0) {
      // Option 1: Forcer un défi avec un utilisateur déjà en défi (déconseillé en production)
      // availableUsers = allUsers;
      
      // Option 2: Retourner une erreur plus claire
      return res.status(400).json({ 
        message: "All users are currently in challenges. Please try again later."
      });
    }
    
    // Sélectionner un utilisateur aléatoire
    const randomIndex = Math.floor(Math.random() * availableUsers.length);
    const challenged = availableUsers[randomIndex]._id;
    
    // Créer un défi avec une durée de 5 minutes
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 5 * 60 * 1000); // 5 minutes
    
    const newChallenge = new Challenge({
      challenger,
      challenged,
      startTime,
      endTime,
      isActive: true
    });
    
    // Marquer les deux utilisateurs comme étant en défi
    await User.updateMany(
      { _id: { $in: [challenger, challenged] } },
      { inChallenge: true }
    );
    
    await newChallenge.save();
    
    // Émettre un événement socket pour notifier l'utilisateur défié
    // Utiliser l'objet io importé au lieu de req.io qui peut ne pas être défini
    const challengedSocketId = getReceiverSocketId(challenged.toString());
    if (challengedSocketId) {
      io.to(challengedSocketId).emit("newChallenge", newChallenge);
    }
    
    res.status(201).json(newChallenge);
  } catch (error) {
    console.error("Error creating challenge:", error);
    res.status(500).json({ message: "Error creating challenge" });
  }
};

// Obtenir les défis actifs d'un utilisateur
export const getUserChallenges = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const challenges = await Challenge.find({
      $or: [{ challenger: userId }, { challenged: userId }],
      isActive: true
    }).populate("challenger challenged", "fullName profilePic");
    
    res.status(200).json(challenges);
  } catch (error) {
    console.error("Error getting user challenges:", error);
    res.status(500).json({ message: "Error getting user challenges" });
  }
};

// Soumettre une réponse au défi
export const submitGuess = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { isReal, isChallenger } = req.body;
    const userId = req.user._id;
    
    const challenge = await Challenge.findById(challengeId);
    
    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }
    
    if (!challenge.isActive) {
      return res.status(400).json({ message: "Challenge is no longer active" });
    }
    
    // Vérifier si l'utilisateur fait partie du défi
    const isParticipant = 
      challenge.challenger.equals(userId) || 
      challenge.challenged.equals(userId);
    
    if (!isParticipant) {
      return res.status(403).json({ message: "You are not part of this challenge" });
    }
    
    // Mettre à jour le challenge avec la réponse
    if (isChallenger) {
      challenge.challengerGuessedCorrectly = isReal;
    } else {
      challenge.challengedGuessedCorrectly = isReal;
    }
    
    // Vérifier si les deux participants ont répondu
    const bothAnswered = 
      challenge.challengerGuessedCorrectly !== undefined && 
      challenge.challengedGuessedCorrectly !== undefined;
    
    if (bothAnswered) {
      challenge.isActive = false;
      
      // Attribuer des points
      await updatePoints(challenge);
    }
    
    await challenge.save();
    
    res.status(200).json({ message: "Guess submitted successfully" });
  } catch (error) {
    console.error("Error submitting guess:", error);
    res.status(500).json({ message: "Error submitting guess" });
  }
};

// Mettre à jour les points des utilisateurs
const updatePoints = async (challenge) => {
  try {
    const challenger = await User.findById(challenge.challenger);
    const challenged = await User.findById(challenge.challenged);
    
    // Déterminer les points à donner
    const challengerPoints = challenge.challengerGuessedCorrectly ? 10 : 0;
    const challengedPoints = challenge.challengedGuessedCorrectly ? 10 : 0;
    
    // Mettre à jour les statistiques du challenger
    challenger.points += challengerPoints;
    challenger.gamesPlayed += 1;
    if (challengerPoints > 0) challenger.gamesWon += 1;
    challenger.inChallenge = false;
    
    // Mettre à jour les statistiques du défié
    challenged.points += challengedPoints;
    challenged.gamesPlayed += 1;
    if (challengedPoints > 0) challenged.gamesWon += 1;
    challenged.inChallenge = false;
    
    await challenger.save();
    await challenged.save();
  } catch (error) {
    console.error("Error updating points:", error);
  }
};

// Obtenir le classement des joueurs
export const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await User.find({})
      .sort({ points: -1 })
      .limit(10)
      .select("fullName profilePic points gamesPlayed gamesWon");
    
    res.status(200).json(leaderboard);
  } catch (error) {
    console.error("Error getting leaderboard:", error);
    res.status(500).json({ message: "Error getting leaderboard" });
  }
};

// Nouvelle fonction pour démarrer un défi aléatoire entre deux utilisateurs en ligne
export const startRandomChallenge = async (req, res) => {
  try {
    // Trouver tous les utilisateurs disponibles (non engagés dans un défi)
    const availableUsers = await User.find({ 
      inChallenge: false
    });
    
    if (availableUsers.length < 2) {
      return res.status(400).json({ message: "Not enough users available for a random challenge" });
    }
    
    // Sélectionner aléatoirement deux utilisateurs différents
    const shuffledUsers = [...availableUsers].sort(() => 0.5 - Math.random());
    const selectedUsers = shuffledUsers.slice(0, 2);
    
    const challenger = selectedUsers[0]._id;
    const challenged = selectedUsers[1]._id;
    
    // Créer un défi avec une durée de 5 minutes
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 5 * 60 * 1000); // 5 minutes
    
    const newChallenge = new Challenge({
      challenger,
      challenged,
      startTime,
      endTime,
      isActive: true
    });
    
    // Marquer les deux utilisateurs comme étant en défi
    await User.updateMany(
      { _id: { $in: [challenger, challenged] } },
      { inChallenge: true }
    );
    
    await newChallenge.save();
    
    // Notifier les deux utilisateurs du nouveau défi via socket
    const challengerSocketId = getReceiverSocketId(challenger.toString());
    const challengedSocketId = getReceiverSocketId(challenged.toString());
    
    if (challengerSocketId) {
      io.to(challengerSocketId).emit("newChallenge", {
        ...newChallenge.toObject(),
        isRandomMatch: true
      });
    }
    
    if (challengedSocketId) {
      io.to(challengedSocketId).emit("newChallenge", {
        ...newChallenge.toObject(),
        isRandomMatch: true
      });
    }
    
    res.status(201).json({
      message: "Random challenge started successfully",
      challenge: newChallenge,
      users: [
        { id: challenger, name: selectedUsers[0].fullName },
        { id: challenged, name: selectedUsers[1].fullName }
      ]
    });
  } catch (error) {
    console.error("Error starting random challenge:", error);
    res.status(500).json({ message: "Error starting random challenge" });
  }
}; 