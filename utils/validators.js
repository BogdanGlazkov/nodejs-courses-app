const { body } = require("express-validator");
const User = require("../models/userModel");

exports.registerValidators = [
  body("email")
    .isEmail()
    .withMessage("Enter correct email")
    .custom(async (value, req) => {
      try {
        const user = await User.findOne({ email: value });
        if (user) {
          return Promise.reject("User with such email is already exists");
        }
      } catch (error) {
        console.log(error);
      }
    }),
  body(
    "password",
    "Password must contain from 6 to 56 alphanumeric characters"
  ).isLength({ min: 6, max: 56 }),
  body("confirm").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Password doesn't match");
    }
    return true;
  }),
  body("name")
    .isLength({ min: 3 })
    .withMessage("Name must contain at least 3 characters"),
];
