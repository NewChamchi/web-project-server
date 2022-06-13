const { Schema, model, Types } = require("mongoose");
const SeatSchema = new Schema( // 예매할때 객체 생성 후
    {
        name: { type: String, required: true },
        position: {
            column: Number, // 숫자
            row: String, // 영어 대문자
        },
        ticketing: { type: Types.ObjectId, required: true, ref: "Ticketing" },
        member: { type: Types.ObjectId, ref: "Member" },
        isBooked: { type: Number, required: true },
    },
    { timestamps: true }
);

const Seat = model("Seat", SeatSchema);
module.exports = { Seat };