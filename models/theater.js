const { Schema, model, Types } = require("mongoose");
const TheaterSchema = new Schema(
    {
        name : { type: String, required: true },
        floor : { type: Number, required : true },
        totalSeatCount : { type: Number, required : true },
        ticketings : [{ type : Types.ObjectId , ref: 'Ticketing'}],
    },
    { timestamps: true }
);
const Theater = model("Theater", TheaterSchema);
module.exports = { Theater };