const express = require("express");
const { check, body } = require("express-validator");

const authController = require("../controllers/authController");
const User = require("../models/userModel");

const router = express.Router();

router.get("/login", authController.getLogin);

router.get("/signup", authController.getSignup);

router.get("/reset", authController.getReset);

router.get("/reset/:token", authController.getNewPassword);

router.post(
  "/signup",
  [
    check("name")
      .not()
      .isEmpty()
      .withMessage("Please enter a valid name"),
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .custom((value, { req }) => {
        //   The below is an ASYNC VALIDTION BECAUSE WE HAVE TO QUERY DB
        return User.findOne({ email: value }).then(userDoc => {
          if (userDoc) {
            return Promise.reject("Email already exists, please try again.");
          }
        });
      })
      .normalizeEmail(),
    body("password")
      .trim()
      .isLength({ min: 6 })
      .withMessage("Password should be minimum 6 characters."),
    body("confirmPassword")
      .trim()
      .isLength({ min: 6 })
      .withMessage("Passwords should match.")
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords should match.");
        }
        return true;
      })
  ],
  authController.postSignup
);

router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .normalizeEmail(),
    body("password")
      .trim()
      .isLength({ min: 6 })
      .withMessage("Password should be minimum 6 characters.")
  ],
  authController.postLogin
);

router.post("/logout", authController.postLogout);

router.post("/reset", authController.postReset);

router.post("/new-password", authController.postNewPassword);

module.exports = router;
