//  const mongoose = require('mongoose');
// const debug = require("debug")("application:database");
// const config = require("config");

// mongoose
// .connect(`${config.get("MONGODB_URI")}/firststep`, )
// .then(function(){
//     debug("connected to database");
// })
// .catch(function(err){
//     debug(err);
// });

// module.exports = mongoose.connection;

const mongoose = require("mongoose");
const debug = require("debug")("application:database");

mongoose
.connect(`${process.env.MONGODB_URI}/firststep`)
.then(function(){
    debug("connected to database");
    console.log("MongoDB Connected");
})
.catch(function(err){
    debug(err);
    console.log(err);
});

module.exports = mongoose.connection;