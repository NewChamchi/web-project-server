const { Schema, model, Types } = require("mongoose");
const MovieSchema = new Schema(
    {
        contents: {
        name: { type: String, required: true },
        poster: { type: String, required: true }, // 포스터 파일의 주소값이 들어감
        director: String,
        actor: String,
        genre: String,
        Runtime: Number,
        ageLimit: Number, // 영화 상세 설명란의 기본에 etc외에 들어가는 값. ageLimit + "세 이용가, " + etc와 같은 형태로 만들어야함
        release: String,
        etc: String,
        },
        scores : {
            bookingRate : Number,
            avgPoint : Number,
        },
        // comments: [{ type : Types.ObjectId }],
        ticketings : [{ type : Types.ObjectId , ref: 'Ticketing'}],
    },
    { timestamps: true }
);
const Movie = model("Movie", MovieSchema);
module.exports = { Movie };