import User from "../models/user.model.js";

// Obtenir le profil d'un utilisateur
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error("Error getting user profile:", error);
    res.status(500).json({ message: "Error getting user profile" });
  }
};

// Mettre à jour le profil d'un utilisateur
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const updates = req.body;
    
    // Empêcher la mise à jour du mot de passe via cette route
    delete updates.password;
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true }
    ).select("-password");
    
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Error updating user profile" });
  }
}; 