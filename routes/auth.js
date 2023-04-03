const { Router } = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const router = Router();

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

router.post("/register", async (req, res) => {
  try {
    const { email, name, password, repeat } = req.body;
    const candidate = await User.findOne({ email });

    if (candidate) {
      req.flash("registerError", "User with such email is already exists");
      res.redirect("/auth/login#register");
    } else {
      const hashPassword = await bcrypt.hash(password, 10);
      const user = new User({
        email,
        name,
        password: hashPassword,
        cart: { items: [] },
      });
      await user.save();
      res.redirect("/auth/login#login");
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
