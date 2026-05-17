require("dotenv").config();
const express = require('express');
const app = express();

const cookieParser = require("cookie-parser");
const path = require("path");
const jwt = require("jsonwebtoken"); // ✅ ADD THIS

app.use(express.json());
app.use(express.urlencoded({extended : true}));

const ownersRouter = require("./routes/ownersRouter");
const usersRouter = require("./routes/usersRouter");
const productsRouter = require("./routes/productsRouter");   

const db = require("./config/mongoose-connection");



app.use(cookieParser());


// 🌍 GLOBAL USER MIDDLEWARE (ADD THIS BLOCK HERE)
app.use(function(req, res, next){

    let token = req.cookies.token;

    if(token){
        try{
           let data = jwt.verify(token, process.env.JWT_SECRET);
            res.locals.user = data; // ✅ available in ALL views
        } catch(err){
            res.locals.user = null;
        }
    } else {
        res.locals.user = null;
    }

    next();
});


app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

app.use("/owners", ownersRouter);
app.use("/users", usersRouter);
app.use("/products", productsRouter);

const productModel = require("./models/product-model");

app.get("/", async (req, res)=>{

    let products = await productModel.find().limit(4);

    res.render("index", { products });
});

app.get("/success", function(req, res){
    res.render("success");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});