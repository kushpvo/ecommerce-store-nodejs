const express = require("express");
const { body, check } = require("express-validator");

const router = express.Router();

const adminController = require("../controllers/adminController");
const isAuth = require("../middleware/is-auth");

router.get("/add-product", isAuth, adminController.getAddProduct);

router.post(
  "/add-product",
  [
    body("title")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Minimum 3 characters required"),
    body("price")
      .trim()
      .isFloat(),
    body("description")
      .trim()
      .isLength({ min: 5, max: 400 })
      .withMessage("Minimum 5 and maximum 400 characters allowed")
  ],
  isAuth,
  adminController.postAddProduct
);

router.get("/products", isAuth, adminController.getProducts);

router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

router.post(
  "/edit-product",
  [
    body("title")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Minimum 3 characters required"),
    body("price")
      .trim()
      .isFloat(),
    body("description")
      .trim()
      .isLength({ min: 5, max: 400 })
      .withMessage("Minimum 5 and maximum 400 characters allowed")
  ],
  isAuth,
  adminController.postEditProduct
);

router.delete("/product/:productId", isAuth, adminController.deleteProduct);

module.exports = router;
