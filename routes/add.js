const { Router } = require("express");
const Course = require("../models/courseModel");
const router = Router();

router.get("/", (req, res) => {
  res.render("add", { title: "Add course", isAdd: true });
});

router.post("/", async (req, res) => {
  try {
    const { title, price, img } = req.body;
    const course = new Course({ title, price, img });
    await course.save();

    res.redirect("/courses");
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;