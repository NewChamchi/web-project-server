const express = require("express");
const express_session = require('express-session');
const userRouter = express.Router();
const { Member } = require("../models/member");
const { Ticketing } = require("../models/ticketing");
const { Seat } = require("../models/seat");

userRouter.get("/login", async (req, res) => {
    const { id, password } = req.query;
    const member = await Member.find({
        $and: [
            { id: id },
            { password: password }
        ]
    });
    if (member[0]._id) {
        req.session.user_id = id;
        console.log(id)
    }
    if (member != undefined) {
        return res.send({ isExist: true, member });
    } else {
        return res.send({ isExist: false });
    }
});

userRouter.get("/join", async (req, res) => {
    const { id } = req.query;
    const member = await Member.find({ id: id }, "_id");
    if (member != undefined) {
        return res.send({ isExist: true });
    } else {
        return res.send({ isExist: false });
    }
});

userRouter.post("/join", async (req, res) => {
    try {
        const member = new Member(req.body);
        await member.save();
        // return res.send({ member });    
        return res.status(200).json({
            success: true
        });
    } catch (err) {
        console.log(err);
        return res.status(400).send({ err: err.message });
    }
});

userRouter.get("/get_member_oid", async (req, res) => {
    const { id } = req.query;
    const member = await Member.find({ id: id }, "_id");
    return res.send({ member });
});

userRouter.get("/mypage", async (req, res) => {
    try {
        const { member_id } = req.query;
        const seats = await Seat.find({ member: member_id }, "name")
            .populate('ticketing', 'startTime')
            .populate({ path: 'ticketing', populate: { path: 'movie', select: 'contents.name' } })
            .populate({ path: 'ticketing', populate: { path: 'theater', select: 'name' } });
        // .populate({path: 'movie', select : 'name'})
        // .populate({path: 'theater', select : 'name'});
        const member = await Member.find({ _id: member_id });
        return res.send({ seats, member });
    } catch (err) {
        console.log(err);
        res.status(500).send({ err: err.message });
    }
})



module.exports = userRouter;
