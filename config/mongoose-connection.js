const mongoose = require('mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/firststep")
.then(function(){
    console.log("connected to database");
})
.catch(function(err){
    console.log("error connecting to database");
    console.log(err);
});

module.exports = mongoose.connection;