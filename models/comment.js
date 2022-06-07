const { Schema, model, Types } = require("mongoose");
const CommentSchema = new Schema(
    {
        comment : { type : String, required : true },
        point : { type : Number, required : true},
        movie : { type : Types.ObjectId, required : true, ref : "Movie" },
        member : { type : Types.ObjectId, required : true, ref : "Member"}, 
    },
    { timestamps : true }
);

const Comment = model("Comment", CommentSchema);
module.exports = { Comment };