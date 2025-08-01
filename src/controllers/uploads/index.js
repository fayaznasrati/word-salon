import dotenv from "dotenv";
import User from "../../../models/user.model.js";
import { validationResult } from "express-validator";

dotenv.config();

export const setUserProfileImageRoute = async (randomId, req, res) => {
  try {
     const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    console.log('Upload/setUserProfileImageRoute', JSON.stringify(req.body), JSON.stringify(req.query))
    
    const id = req.params.id;

    if (!req.file) {
      return res.status(400).send({ message: "No image was set" });
    }

    const foundUser = await User.findByPk(id);

    if (!foundUser) {
      return res.status(400).send({ message: "No user found" });
    }

    const image = req.file;
    const profileImageUrl = `${process.env.APP_URL_API}/public/images/users/${id}/${randomId}-${image.originalname}`;

    await User.update(
      { profile_image: profileImageUrl },
      { where: { id } }
    );

    const sentData = {
      url: profileImageUrl,
    };

    return res.status(201).send(sentData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
