const { Schema, model, Types } = require("mongoose");
const SeatSchema = new Schema(
    {
        name: { type: String, required: true },
        position: {
            column: Number, // 숫자
            row: String, // 영어 대문자
        },
        ticketing: { type: Types.ObjectId, required: true, ref: "Ticketing" },
        member: { type: Types.ObjectId, required: true, ref: "Member" },
    },
    { timestamps : true }
);

const Seat = model("Seat", SeatSchema);
module.exports = { Seat };