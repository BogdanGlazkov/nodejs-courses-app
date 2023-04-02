const { Router } = require("express");
const User = require("../models/userModel");
const router = Router();

router.get("/login", async (req, res) => {
  res.render("auth/login", {
    title: "Autorization",
    isLogin: true,
  });
});

router.get("/logout", async (req, res) => {
  req.session.destroy(() => {
    res.redirect("/auth/login#login");
  });
});

router.post("/login", async (req, res) => {
  const user = await User.findById("6424a2337527783a76be8255");
  req.session.user = user;
  req.session.isAuthenticated = true;
  req.session.save((err) => {
    if (err) {
      throw err;
    } else {
      res.redirect("/");
    }
  });
});

module.exports = router;
