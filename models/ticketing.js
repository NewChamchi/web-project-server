const { Schema, model, Types } = require("mongoose");
const TicketingSchema = new Schema(
    {
        startTime : { type : Date, required : true }, // 영화 상영 시작 시간
        movie : { type : Types.ObjectId, required : true, ref : "Movie"},
        bookingSeatCount: { type: Number, required : true },
        theater : { type : Types.ObjectId, required : true, ref : "Theater"},
        // seats : [{ type : Types.ObjectId }],
    },
    { timestamps : true }
);
const Ticketing = model("Ticketing", TicketingSchema);
module.exports = { Ticketing };