import { ExtractJwt } from "passport-jwt";
import passportJWT from "passport-jwt";
import dotenv from "dotenv";
import passport from "passport";
import db from '../models/index.js';
const { User } = db;
dotenv.config();
const JWTStrategy = passportJWT.Strategy;

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    async (jwtPayload, done) => {
      try {
        const theUser = await User.findByPk(jwtPayload.id); // ✅ Sequelize method
        if (!theUser) return done(null, false);
        return done(null, theUser);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);
