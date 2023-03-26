const Router = require("express");
const Cart = require("../models/cartModel");
const Course = require("../models/courseModel");

const router = Router();

router.get("/", async (req, res) => {
  const cart = await Cart.fetch();
  res.render("cart", {
    title: "Cart",
    isCart: true,
    courses: cart.courses,
    price: cart.price,
  });
});

router.post("/add", async (req, res) => {
  const course = await Course.getById(req.body.id);
  await Cart.add(course);
  res.redirect("/cart");
});

router.delete("/remove/:id", async (req, res) => {
  console.log(1);
  const cart = await Cart.remove(req.params.id);
  res.status(200).json(cart);
});

module.exports = router;
