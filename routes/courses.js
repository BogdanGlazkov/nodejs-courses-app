const { Router } = require("express");
const { validationResult } = require("express-validator");
const Course = require("../models/courseModel");
const auth = require("../middlewares/auth");
const { courseValidators } = require("../utils/validators");
const router = Router();

function isOwner(course, req) {
  return course.userId.toString() === req.user._id.toString();
}

router.get("/", async (req, res) => {
  try {
    const courses = await Course.find().lean().populate("userId", "email name");
    res.render("courses", {
      title: "Courses",
      isCourses: true,
      userId: req.user ? req.user._id.toString() : null,
      courses,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).lean();
    res.render("course", {
      layout: "empty",
      title: `Course ${course?.title}`,
      course,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/:id/edit", auth, async (req, res) => {
  if (!req.query.allow) {
    return res.redirect("/");
  }
  try {
    const course = await Course.findById(req.params.id).lean();
    if (!isOwner(course, req)) {
      return res.redirect("/courses");
    }
    res.render("course-edit", {
      title: `Edit ${course?.title}`,
      course,
    });
  } catch (error) {
    console.log(error);
  }
});

router.post("/edit", auth, courseValidators, async (req, res) => {
  const { id } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).redirect(`/courses/${id}/edit?allow=true`);
  }
  try {
    delete req.body.id;
    const course = await Course.findById(id);
    if (!isOwner(course, req)) {
      return res.redirect("/courses");
    }

    Object.assign(course, req.body);
    await course.save();
    res.redirect("/courses");
  } catch (error) {
    console.log(error);
  }
});

router.post("/remove", auth, async (req, res) => {
  try {
    const { id } = req.body;
    await Course.deleteOne({ _id: req.body.id, userId: req.user._id });
    res.redirect("/courses");
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
