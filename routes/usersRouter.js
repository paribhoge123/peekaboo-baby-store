
const express = require("express");
const router = express.Router();
const userModel = require("../models/user-model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const isLoggedIn = require("../utils/isLoggedIn");


// ✅ REGISTER (Step 2)
router.post("/register", async function(req, res){
    let { fullname, email, password } = req.body;

    let user = await userModel.findOne({ email });
    if(user){
        return res.status(400).send("User already exists");
    }

    bcrypt.hash(password, 10, async function(err, hash){
        let newUser = await userModel.create({
            fullname,
            email,
            password: hash
        });

        let token = jwt.sign({ email: email }, "secretkey");

        res.cookie("token", token);
        res.redirect("/");
    });
});


// ✅ LOGIN (Step 3 → PUT IT HERE)
router.post("/login", async function(req, res){
    let { email, password } = req.body;

    let user = await userModel.findOne({ email });
    if(!user){
        return res.status(400).send("User not found");
    }

    bcrypt.compare(password, user.password, function(err, result){
        if(result){

            // ✅ THIS IS CRITICAL
            let token = jwt.sign(
                { email: user.email },
                "secretkey"
            );

            res.cookie("token", token);   // ✅ THIS SETS COOKIE

            res.redirect("/"); // 🔥 IMPORTANT CHANGE

        } else {
            res.status(400).send("Wrong password");
        }
    });
});

// ✅ 🔐 PROTECTED ROUTE (PUT IT HERE)
router.get("/profile", isLoggedIn, function(req, res){
res.render("profile", { user: req.user });});



// ✅ LOGOUT
router.get("/logout", function(req, res){
    res.cookie("token", "");
    res.send("Logged out");
});


// router.get("/profile", isLoggedIn, function(req, res){
//     res.send("Welcome " + req.user.email);
// });

router.get("/login", function(req, res){
    res.render("login");
});

router.get("/register", function(req, res){
    res.render("register");
});

router.get("/cart", isLoggedIn, async function(req, res){

    let user = await userModel
        .findOne({ email: req.user.email })
        .populate("cart.product")
    let cart = user.cart || [];

    user.cart = user.cart.filter(item => item.product != null);

    // 💰 CALCULATE TOTAL
    let total = 0;

cart.forEach(item => {
    if(item.product && item.product.price){
        total += item.product.price * item.quantity;
    }
});
    res.render("cart", { cart, total });

});
router.get("/all", async function(req, res){
    let users = await userModel.find();
    res.send(users);
});

router.get("/remove/:productid", isLoggedIn, async function(req, res){

    let user = await userModel.findOne({ email: req.user.email });

    let productId = req.params.productid;

    // 🔍 Find item
    let itemIndex = user.cart.findIndex(
        item => item.product.toString() === productId
    );

    if(itemIndex > -1){

        if(user.cart[itemIndex].quantity > 1){
            // ✅ Decrease quantity
            user.cart[itemIndex].quantity -= 1;
        } else {
            // ✅ Remove completely
            user.cart.splice(itemIndex, 1);
        }
    }

    await user.save();

    res.redirect("/users/cart");

});

router.get("/increase/:productid", isLoggedIn, async function(req, res){

    let user = await userModel.findOne({ email: req.user.email });

    let item = user.cart.find(
        item => item.product.toString() === req.params.productid
    );

    if(item){
        item.quantity += 1;
    }

    await user.save();

    res.redirect("/users/cart");
});

router.get("/decrease/:productid", isLoggedIn, async function(req, res){

    let user = await userModel.findOne({ email: req.user.email });

    let index = user.cart.findIndex(
        item => item.product.toString() === req.params.productid
    );

    if(index > -1){

        if(user.cart[index].quantity > 1){
            user.cart[index].quantity -= 1;
        } else {
            user.cart.splice(index, 1); // remove if 1
        }
    }

    await user.save();

    res.redirect("/users/cart");
});


// // 💳 CHECKOUT PAGE
router.get("/checkout", isLoggedIn, async function(req, res){

    let user = await userModel.findOne({
        email: req.user.email
    }).populate("cart.product");

    let total = 0;

    user.cart.forEach(item => {

        if(item.product){
            total += item.product.price * item.quantity;
        }

    });

    res.render("checkout", {
        cart: user.cart,
        total,
        user
    });
});


router.get("/orders", isLoggedIn, async function(req, res){
    

    let user = await userModel
        .findOne({ email: req.user.email })
        .populate("orders.products.product");

    // 🧹 CLEAN BAD DATA
    user.orders.forEach(order => {
        order.products = order.products.filter(item => item.product != null);
    });
    user.orders.reverse();

    res.render("orders", { orders: user.orders });
});

// 💳 CHECKOUT PAGE
router.get("/checkout", isLoggedIn, async function(req, res){

    let user = await userModel.findOne({
        email: req.user.email
    }).populate("cart.product");

    let total = 0;

    user.cart.forEach(item => {

        if(item.product){
            total += item.product.price * item.quantity;
        }

    });

    res.render("checkout", {
        cart: user.cart,
        total,
        user
    });
});

// ❤️ WISHLIST PAGE
router.get("/wishlist", isLoggedIn, async function(req, res){

    let user = await userModel.findOne({
        email: req.user.email
    }).populate("wishlist");

    res.render("wishlist", {
        wishlist: user.wishlist,
        user
    });
});

module.exports = router;