import dotenv from "dotenv";
import nodemailer from "nodemailer";
import randomToken from "random-token";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../../models/user.model.js";
import Role from "../../../models/role.model.js";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASSWORD,
  },
});

export const loginRouteHandler = async (req, res, email, password) => {
  try {
    const foundUser = await User.findOne({ where: { email } });
    if (!foundUser) {
      return res.status(400).json({
        errors: [
          {
            detail:
              "The provided authorization grant (e.g., authorization code, resource owner credentials) or refresh token is invalid, expired, revoked, does not match the redirection URI used in the authorization request, or was issued to another client.",
          },
        ],
      });
    }

    const validPassword = await bcrypt.compare(password, foundUser.password);
    if (validPassword) {
      const token = jwt.sign(
        { id: foundUser.id, email: foundUser.email },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );
      return res.json({
        token_type: "Bearer",
        expires_in: "1h",
        access_token: token,
        refresh_token: token,
      });
    } else {
      return res.status(400).json({
        errors: [{ detail: "Invalid password" }],
      });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const registerRouteHandler = async (req, res, name, email, password) => {
  try {
    const foundUser = await User.findOne({ where: { email } });
    if (foundUser) {
      return res.status(400).json({ message: "The email is already in use" });
    }

    if (!password || password.length < 8) {
      return res
        .status(400)
        .json({ message: "The password must be at least 8 characters long." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const adminRole = await Role.findOne({ where: { name: "admin" } });

    const newUser = await User.create({
      name,
      email,
      password: hashPassword,
      role: adminRole ? adminRole.id : null,
      created_at: new Date(),
      updated_at: new Date(), 
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    return res.status(200).json({
      token_type: "Bearer",
      expires_in: "1h",
      access_token: token,
      refresh_token: token,
      
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const forgotPasswordRouteHandler = async (req, res, email) => {
  try {
    const foundUser = await User.findOne({ where: { email } });

    if (!foundUser) {
      return res.status(400).json({
        errors: { email: ["The email does not match any existing user."] },
      });
    }

    const token = randomToken(20);

    await transporter.sendMail({
      from: "admin@jsonapi.com",
      to: email,
      subject: "Reset Password",
      html: `<p>You requested to change your password. If this request was not made by you, please contact us. Access <a href='${process.env.APP_URL_CLIENT}/auth/reset-password?token=${token}&email=${email}'>this link</a> to reset your password.</p>`,
    });

    const dataSent = {
      data: "password-forgot",
      attributes: {
        redirect_url: `${process.env.APP_URL_API}/password-reset`,
        email,
      },
    };
    return res.status(204).json(dataSent);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const resetPasswordRouteHandler = async (req, res) => {
  try {
    const foundUser = await User.findOne({ where: { email: req.body.data.attributes.email } });

    if (!foundUser) {
      return res.status(400).json({
        errors: { email: ["The email does not match any existing user."] },
      });
    }

    const { password, password_confirmation } = req.body.data.attributes;

    if (password.length < 8) {
      return res.status(400).json({
        errors: {
          password: ["The password should have at least 8 characters."],
        },
      });
    }

    if (password !== password_confirmation) {
      return res.status(400).json({
        errors: {
          password: ["The password and password confirmation must match."],
        },
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    await User.update({ password: hashPassword }, { where: { email: foundUser.email } });

    return res.sendStatus(204);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
