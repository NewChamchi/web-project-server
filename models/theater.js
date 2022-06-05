const mongoose = require("mongoose");
const { Schema } = mongoose;
const TheaterSchema = new Schema(
    {
        name : { type: String, required: true },
        floor : Number,
        seatCount : { type : Number, required : true},
    },
    { timestamps: true }
);
const Theater = mongoose.model("Theater", TheaterSchema);
module.exports = { Theater };