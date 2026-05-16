const mongoose = require('mongoose');

const productSchema = mongoose.Schema({

    image : [String],

    name  : String,

    price : Number,

    discount : {
        type : Number,
        default : 0
    },

    category : String,

    bgcolor : String,

    panelcolor : String,

    textcolor : String,

    reviews: [
        {
            user: String,

            rating: Number,

            comment: String,

            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ]

});

module.exports = mongoose.model("products", productSchema);