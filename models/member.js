const mongoose = require("mongoose");
const { Schema } = mongoose;
const MemberSchema = new Schema(
    {
        name : { type : String, required : true },
        birth : { type : String, required : true },
        phone : { type : String, required : true },
        id : { type : String, required : true },
        password : { type : String, required : true },
        isAdmin : { type : Boolean },
    },
    { timestamps: true }
);
const Member = mongoose.model("Member", MemberSchema);
module.exports = { Member };