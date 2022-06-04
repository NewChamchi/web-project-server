const express = require("express");
const userRouter = express.Router();
const { Member } = require("../models/member");
const { Seat } = require("../models/seat");
const { Ticketing } = require("../models/ticketing");
const { Theater } = require("../models/theater");
const { Movie } = require("../models/movie");
const { Blog } = require("../../mongo/models/blog");

userRouter.get("/login", async (req, res) => {
    const { id, password } = req.query;
    const member = await Member.find({
        $and: [
            { id: id },
            { password: password }
        ]
    });
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
    const { id } = req.query;
    const seats = await Seat.find({ member: id }, "name");
    } catch (error) {
        console.log(error);
        res.status(500).send({ error : error.message });
    }
})

module.exports = userRouter;
