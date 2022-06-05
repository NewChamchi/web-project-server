const { Schema, model, Types } = require("mongoose");
const TicketingSchema = new Schema(
    {
        startTime : { type : Date, required : true }, // 영화 상영 시작 시간
        movie : { type : Types.ObjectId, required : true, ref : "Moive"},
        theater : { type : Types.ObjectId, required : true, ref : "Theater"},
        bookingSeatCount : { type : Number, required : true },
    },
    { timestamps : true }
);

TicketingSchema.virtual("seats", {
    ref : "Seat",
    localField : "_id",
    foreignField : "ticketing",
});
TicketingSchema.set("toObject", { virtuals : true });
TicketingSchema.set("toJSON", { virtuals : true });

const Ticketing = model("Ticketing", TicketingSchema);
module.exports = { Ticketing };