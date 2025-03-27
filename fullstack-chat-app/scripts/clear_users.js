// Script pour supprimer tous les utilisateurs de la base de données
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Configuration pour le chemin .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../backend/.env") });

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connecté à MongoDB");
    
    // Supprimer tous les utilisateurs
    mongoose.connection.db.collection("users").deleteMany({})
      .then(result => {
        console.log(`${result.deletedCount} utilisateurs ont été supprimés`);
        mongoose.disconnect();
      })
      .catch(err => {
        console.error("Erreur lors de la suppression:", err);
        mongoose.disconnect();
      });
  })
  .catch(err => {
    console.error("Erreur de connexion à MongoDB:", err);
  }); 