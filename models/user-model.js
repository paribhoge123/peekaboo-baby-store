const mongoose = require('mongoose');


const userSchema = mongoose.Schema({
      fullname : {
        type : String,
        minLength : 3,
        trim : true,  
    },
    email  : String,
    password : String,
    cart: [
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products"
    },
    quantity: {
      type: Number,
      default: 1
    }
  }
],
    
    orders: [
    {
        products: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "products"
                },
                quantity: Number
            }
        ],
        totalAmount: Number,
        date: {
            type: Date,
            default: Date.now
        }
    }
],
    contact : Number,
    picture : String,

    wishlist: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products"
    }

],
});

 module.exports  = mongoose.model("users", userSchema);