 const mongoose = require('mongoose');
const debug = require("debug")("application:database");
const config = require("config");

mongoose
.connect(`${config.get("MONGODB_URI")}/firststep`, )
.then(function(){
    debug("connected to database");
})
.catch(function(err){
    debug(err);
});

module.exports = mongoose.connection;