
const express = require("express");
const router = express.Router();

const productModel = require("../models/product-model");
const userModel = require("../models/user-model");
const isLoggedIn = require("../utils/isLoggedIn");
const isAdmin = require("../utils/isAdmin");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const razorpay = require("../config/razorpay");
const OpenAI = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/uploads");
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + "-" + file.originalname;
        cb(null, uniqueName);
    }
});


const upload = multer({ storage: storage });

// ✅ CREATE PRODUCT (keep this)
router.post("/create", upload.array("image", 5), async function(req,res){
    await productModel.create({
        name: req.body.name,
        price: req.body.price,
        category: req.body.category,
       image: req.files.map(file => file.filename)
    });

    res.redirect("/products/shop");
});

// ✅ SHOP PAGE (keep this)
// 

router.get("/shop", isLoggedIn, async function(req, res){

    let search = req.query.search || "";
    let category = req.query.category || "";

    let filter = {};

    // 🔍 Search filter
    if(search){
        filter.name = {
            $regex: search,
            $options: "i"
        };
    }

    // 🧸 Category filter
    if(category){

    filter.category = {
        $regex: new RegExp("^" + category + "$", "i")
    };

}

    let products = await productModel.find(filter);

    let user = await userModel.findOne({
        email: req.user.email
    });

    let cartCount = user.cart.length;
    console.log(category);
console.log(products);

    res.render("shop", {
        products,
        cartCount,
        user
    });

});


// 🆕 ADD TO CART (ADD THIS, don’t replace anything)
router.get("/addtocart/:productid", isLoggedIn, async function(req, res){

    let user = await userModel.findOne({
        email: req.user.email
    });

    let productId = req.params.productid;

    let existingItem = user.cart.find(
        item => item.product.toString() === productId
    );

    if(existingItem){

        existingItem.quantity += 1;

    } else {

        user.cart.push({
            product: productId,
            quantity: 1
        });

    }

    await user.save();

    res.redirect(req.headers.referer || "/products/shop");

});
// 💳 CREATE PAYMENT ORDER

router.post("/create-order", isLoggedIn, async function(req, res){

    let user = await userModel.findOne({
        email: req.user.email
    }).populate("cart.product");

    let total = 0;

   user.cart.forEach(item => {

    if(item.product){

        total += item.product.price * item.quantity;

    }

});

    const options = {
        amount: total * 100, // paisa
        currency: "INR",
        receipt: "order_rcptid_" + Date.now()
    };

     console.log(process.env.RAZORPAY_KEY_ID);
console.log(process.env.RAZORPAY_KEY_SECRET);

    const order = await razorpay.orders.create(options);

    res.json({
        orderId: order.id,
        amount: order.amount,
        key: process.env.RAZORPAY_KEY_ID
    });

    

});


// 🧑‍💼 Admin page
router.get("/admin", isLoggedIn, isAdmin, function(req, res){
    res.render("admin");
});

// ➕ CREATE PRODUCT (ADMIN ONLY)
router.post("/create", isLoggedIn, isAdmin, async function(req, res){
    let { name, price, image } = req.body;

    await productModel.create({
        name,
        price,
        image
    });
        console.log(req.user);


    res.redirect("/products/shop");
});

// 🗑️ DELETE PRODUCT (ADMIN ONLY)
router.get("/delete/:id", isLoggedIn, isAdmin, async function(req, res){
    await productModel.findByIdAndDelete(req.params.id);
    res.redirect("/products/shop");
});

// ✏️ EDIT PAGE (ADMIN ONLY)
router.get("/edit/:id", isLoggedIn, isAdmin, async function(req, res){
    let product = await productModel.findById(req.params.id);
    res.render("edit", { product });
});

// 🔄 UPDATE PRODUCT (ADMIN ONLY)
router.post("/update/:id", isLoggedIn, isAdmin, upload.single("image"), async function(req, res){

    let product = await productModel.findById(req.params.id);

    // 🧹 delete old image
    if(product.image){
        let oldPath = path.join(__dirname, "../public/uploads/", product.image);
        fs.unlink(oldPath, (err) => {
            if(err) console.log("Error deleting old image");
        });
    }

    let image = req.file ? req.file.filename : product.image;

    await productModel.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        price: req.body.price,
        image
    });

    res.redirect("/products/shop");
});

router.get("/search", isLoggedIn, async function(req, res){
    console.log(req.query.search);

    let search = req.query.search || "";

   let products = await productModel.find({

    $or: [

        {
            name: {
                $regex: search,
                $options: "i"
            }
        },

        {
            category: {
                $regex: search,
                $options: "i"
            }
        }

    ]

});

    let user = await userModel.findOne({
        email: req.user.email
    });

    res.render("shop", {
        products,
        user,
        cartCount: user.cart.length
    });

});

// 📄 PRODUCT DETAILS PAGE
router.get("/product/:id", isLoggedIn, async function(req, res){

    let product = await productModel.findById(req.params.id);

    let user = await userModel.findOne({ email: req.user.email });

    res.render("product-details", { product, user });
});

// 🍼 CATEGORY FILTER
// router.get("/category/:name", isLoggedIn, async function(req, res){

//     let products = await productModel.find({
//         category: req.params.name
//     });

//     let user = await userModel.findOne({
//         email: req.user.email
//     });

//     res.render("shop", {
//         products,
//         user,
//         cartCount: user.cart.length
//     });
// });

// 🍼 CATEGORY PAGE
// router.get("/category/:category", isLoggedIn, async function(req, res){

//     let products = await productModel.find({
//         category: req.params.category
//     });

//     let user = await userModel.findOne({
//         email: req.user.email
//     });

//     res.render("shop", {
//         products,
//         user,
//         cartCount: user.cart.length
//     });
// });


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

// ⭐ ADD REVIEW
router.post("/review/:id", isLoggedIn, async function(req, res){

    let product = await productModel.findById(req.params.id);

    product.reviews.push({
        user: req.user.email,
        rating: req.body.rating,
        comment: req.body.comment
    });

    await product.save();

    res.redirect("/products/product/" + req.params.id);
});

// 📦 SINGLE PRODUCT PAGE
router.get("/product/:id", async function(req, res){

    let product = await productModel.findById(req.params.id);

    res.render("product-details", {
        product
    });
});

// 🤖 AI CHATBOT

router.post("/ask-ai", async function(req, res){

    let message = req.body.message.toLowerCase();

    let reply = "";

    if(message.includes("delivery")){

        reply = "🚚 Delivery usually takes 3-5 days.";

    }

    else if(message.includes("return")){

        reply = "🔄 We offer a 7 day return policy.";

    }

    else if(message.includes("payment")){

        reply = "💳 We support UPI, debit cards and net banking.";

    }

    else if(message.includes("wishlist")){

        reply = "❤️ You can save products using the wishlist button.";

    }

    else{

        reply = "😊 Peekaboo Assistant is here to help you!";
    }

    res.json({
        reply: reply
    });

});

module.exports = router;