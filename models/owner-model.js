const mongoose = require('mongoose');

const ownerSchema = mongoose.Schema({
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

 mongoose.exports  = mongoose.model("owner", ownerSchema);  