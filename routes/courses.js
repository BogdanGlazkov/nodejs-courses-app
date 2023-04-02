const { Router } = require("express");
const Course = require("../models/courseModel");
const auth = require("../middlewares/auth");
const router = Router();

router.get("/", async (req, res) => {
  const courses = await Course.find().lean().populate("userId", "email name");
  res.render("courses", { title: "Courses", isCourses: true, courses });
});

router.get("/:id", async (req, res) => {
  const course = await Course.findById(req.params.id).lean();
  res.render("course", {
    layout: "empty",
    title: `Course ${course?.title}`,
    course,
  });
});

router.get("/:id/edit", auth, async (req, res) => {
  if (!req.query.allow) {
    return res.redirect("/");
  }
  const course = await Course.findById(req.params.id).lean();

  res.render("course-edit", {
    title: `Edit ${course?.title}`,
    course,
  });
});

router.post("/edit", auth, async (req, res) => {
  const { id } = req.body;
  delete req.body.id;
  await Course.findByIdAndUpdate(id, req.body).lean();
  res.redirect("/courses");
});

router.post("/remove", auth, async (req, res) => {
  try {
    const { id } = req.body;
    await Course.findByIdAndDelete(id).lean();
    res.redirect("/courses");
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
