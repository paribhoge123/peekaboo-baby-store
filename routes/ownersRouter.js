const express = require("express");
const router = express.Router();
const ownerModel = require("../models/owner-model");

if(process.env.NODE_ENV === "application"  ){
router.post("/create",async  function(req, res){
let owners = await ownerModel.find();
if(owners.length > 0){
return res
 .status(400)
 .send("owner already exists");
}
let { fullname, email, password} = req.body;

let createdOwner = await ownerModel.create({
    fullname,
    email, 
    password,

})
res.status(201).send("creating owner");
});
}

router.get("/", function(req, res){
    res.send("hey owners");
});


module.exports = router;