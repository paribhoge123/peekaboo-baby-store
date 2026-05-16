const mongoose = require('mongoose');

const ownerSchema = new mongoose.Schema({
    fullname : {
        type : String,
        minLength : 3,
        trim : true,  
    },
    email  : String,
    password : String,
    picture : String,
    gstin : String,
});

 module.exports  = mongoose.model("owner", ownerSchema);  