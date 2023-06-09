const { Router } = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { validationResult } = require("express-validator");
const nodemailer = require("nodemailer");
const sendgrid = require("nodemailer-sendgrid-transport");
require("dotenv").config();
const User = require("../models/userModel");
const regEmail = require("../emails/registration");
const resetEmail = require("../emails/reset");
const { registerValidators } = require("../utils/validators");
const router = Router();

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const transporter = nodemailer.createTransport(
  sendgrid({
    auth: { api_key: SENDGRID_API_KEY },
  })
);

router.get("/login", async (req, res) => {
  res.render("auth/login", {
    title: "Autorization",
    isLogin: true,
    loginError: req.flash("loginError"),
    registerError: req.flash("registerError"),
  });
});

router.get("/logout", async (req, res) => {
  req.session.destroy(() => {
    res.redirect("/auth/login#login");
  });
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const candidate = await User.findOne({ email });

    if (candidate) {
      const isPasswordValid = await bcrypt.compare(
        password,
        candidate.password
      );
      if (isPasswordValid) {
        req.session.user = candidate;
        req.session.isAuthenticated = true;
        req.session.save((err) => {
          if (err) {
            throw err;
          } else {
            res.redirect("/");
          }
        });
      } else {
        req.flash("loginError", "Password is wrong");
        res.redirect("/auth/login#login");
      }
    } else {
      req.flash("loginError", "There's no such user");
      res.redirect("/auth/login#login");
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/register", registerValidators, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.flash("registerError", errors.array()[0].msg);
      return res.status(422).redirect("/auth/login#register");
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      name,
      password: hashPassword,
      cart: { items: [] },
    });
    await user.save();
    await transporter.sendMail(regEmail(email));
    res.redirect("/auth/login#login");
  } catch (error) {
    console.log(error);
  }
});

router.get("/reset", (req, res) => {
  res.render("auth/reset", {
    title: "Forgot password?",
    error: req.flash("error"),
  });
});

router.get("/password/:token", async (req, res) => {
  if (!req.params.token) {
    return res.redirect("/auth/login");
  }
  try {
    const user = await User.findOne({
      resetToken: req.params.token,
      resetTokenExp: { $gt: Date.now() },
    });
    if (!user) {
      return res.redirect("/auth/login");
    } else {
      res.render("auth/password", {
        title: "Restore access",
        error: req.flash("error"),
        userId: user._id.toString(),
        token: req.params.token,
      });
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/reset", (req, res) => {
  try {
    crypto.randomBytes(32, async (err, buffer) => {
      if (err) {
        req.flash("error", "Something went wrong, try again please");
        return res.redirect("/auth/reset");
      }
      const token = buffer.toString("hex");
      const candidate = await User.findOne({ email: req.body.email });

      if (candidate) {
        candidate.resetToken = token;
        candidate.resetTokenExp = Date.now() + 60 * 60 * 1000;
        await candidate.save();
        await transporter.sendMail(resetEmail(candidate.email, token));
        res.redirect("/auth/login");
      } else {
        req.flash("error", "There's no such email");
        res.redirect("/auth/reset");
      }
    });
  } catch (error) {
    console.log(error);
  }
});

router.post("/password", async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.body.userId,
      resetToken: req.body.token,
      resetTokenExp: { $gt: Date.now() },
    });
    if (user) {
      user.password = await bcrypt.hash(req.body.password, 10);
      user.resetToken = undefined;
      user.resetTokenExp = undefined;
      await user.save();
      res.redirect("/auth/login");
    } else {
      req.flash("error", "Token has expired");
      res.redirect("/auth/login");
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
