import dotenv from "dotenv";
import nodemailer from "nodemailer";
import randomToken from "random-token";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from '../../../models/index.js';
const { user } = db;
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASSWORD,
  },
});

export const loginRouteHandler = async (req, res) => {
  try {
    const { email, password } = req.body
    const founduser = await user.findOne({ where: { email } });
    if (!founduser) {
      return res.status(400).json({
        errors: [
          {
            detail:
              "The provided authorization grant (e.g., authorization code, resource owner credentials) or refresh token is invalid, expired, revoked, does not match the redirection URI used in the authorization request, or was issued to another client.",
          },
        ],
      });
    }

    const validPassword = await bcrypt.compare(password, founduser.password_hash);
    if (validPassword) {
      const token = jwt.sign(
        { id: founduser.id, email: founduser.email },
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

export const logoutRouteHandler = async (req, res) => {
  return res.sendStatus(204); // Just a dummy logout for JWT-based auth
};

export const registerRouteHandler = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const founduser = await user.findOne({ where: { email } });
    if (founduser) {
      return res.status(400).json({ message: "The email is already in use" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const newuser = await user.create({
      name,
      email,
      password_hash: hashPassword,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const token = jwt.sign(
      { id: newuser.id, email: newuser.email },
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
    const founduser = await user.findOne({ where: { email } });

    if (!founduser) {
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
    const founduser = await user.findOne({ where: { email: req.body.data.attributes.email } });

    if (!founduser) {
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

    await user.update({ password: hashPassword }, { where: { email: founduser.email } });

    return res.sendStatus(204);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
