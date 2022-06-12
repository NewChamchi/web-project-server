const { Schema, model, Types } = require("mongoose");
const CommentSchema = new Schema(
    {
        comment : { type : String, required : true },
        point : { type : Number, required : true},
        movie : { type : Types.ObjectId, required : true, ref : "Movie" },
        recommendMember: [{type : Types.ObjectId,  ref : "Member"}],
        recommendCount: {type: Number, required: true},
        member : { type : Types.ObjectId, required : true, ref : "Member"}, 
    },
    { timestamps : true }
);

const Comment = model("Comment", CommentSchema);
module.exports = { Comment };