import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import fs from "fs/promises"; // Use fs.promises for async file operations
import path from "path";

// GET /me
export const getMyProfile = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const { id, name, email, phone, bio, photo_url, created_at, update_at } = req.user;
  res.json({ id, name, email, phone, bio, photo_url, created_at, update_at });
};

// PATCH /me/update
export const updateMyProfile = async (req, res) => {
  try {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    console.log('User/updateMyProfile', JSON.stringify(req.body), JSON.stringify(req.query))
    const { name, phone, bio } = req.body;
    const updates = {};

    // Update text fields if provided
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (bio !== undefined) updates.bio = bio;

    // If a new photo was uploaded
    if (req.file) {
      const oldPhotoPath = req.user.photo_url; // Get the old photo path

      // Delete the old photo if it exists
      if (oldPhotoPath) {
        try {
          const fullOldPath = path.join(process.cwd(), oldPhotoPath);
          await fs.unlink(fullOldPath); // Delete the file
        } catch (err) {
          console.error("Failed to delete old photo:", err);
          // Continue even if deletion fails (don't block the update)
        }
      }

      // Save the new photo path (relative to uploads folder)
      updates.photo_url = `/uploads/profile-photos/${req.file.filename}`;


    }

    updates.updated_at = new Date();
    // Update the user in the database
    await req.user.update(updates);

    // Return success response (exclude sensitive data)
    const userData = req.user.get();
    delete userData.password_hash;

    res.status(201).json({
      message: "Profile updated successfully",
      user: userData,
    });

  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};


// PATCH /me/password
export const updateMyPassword = async (req, res) => {
  try {
     const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    console.log('User/updateMyPassword', JSON.stringify(req.body), JSON.stringify(req.query))
    const { currentPassword, newPassword } = req.body;

    // 1. Check if currentPassword matches the stored hash
    const isMatch = await bcrypt.compare(
      currentPassword,
      req.user.password_hash // Make sure this matches your DB column
    );

    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // 2. Hash the new password
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // 3. Update the password in the database
    await req.user.update({
      password_hash: newPasswordHash,
      updated_at: new Date(),
    });

    // 4. Send success response
    return res.json({ message: "Password updated successfully" });

  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
