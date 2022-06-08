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
    if(member[0]._id) {
        req.session.user_id = id;
        console.log(id)
    }
    return res.send({ member });
})

userRouter.get("/join", async (req, res) => {
    const { id } = req.query;
    const member = await Member.find({ id: id }, "_id");
    return res.send({ member });
})

userRouter.post("/join", async (req, res) => {
    try {
        const member = new Member(req.body);
        await member.save();
        return res.send({ member });
    } catch (err) {
        console.log(err);
        return res.status(400).send({ err: err.message });
    }
});

userRouter.get("/mypage", async (req, res) => {
    try {
    const { member_id } = req.query;
    const seats = await Seat.find({ member: member_id }, "name")
    .populate('ticketing', 'startTime')
    .populate({path: 'ticketing', populate:{ path: 'movie', select : 'contents.name'} })
    .populate({path: 'ticketing', populate:{ path: 'theater', select : 'name'}});
    // .populate({path: 'movie', select : 'name'})
    // .populate({path: 'theater', select : 'name'});
    const member = await Member.find({ _id : member_id});
    return res.send({ seats, member });
    } catch (err) {
        console.log(err);
        res.status(500).send({ err : err.message });
    }
})

userRouter.get('/logout', async (req, res) =>{
    const session = req.session
    try {
        if (session.user_id) { // 세션 정보가 존재하는 경우
            await req.session.destroy( (err) => {
                if (err) {
                console.log(err)
                } else {
                    res.redirect('/login'); // 클라이언트를 첫 페이지로 이동
                }
            })
        }
    } catch (e) {
        console.log(e);
    }
    res.redirect('/login');
})

module.exports = userRouter;
