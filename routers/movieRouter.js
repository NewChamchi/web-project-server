const express = require("express");
const movieRouter = express.Router();
const { Member } = require("../models/member");
const { Ticketing } = require("../models/ticketing");
const { Theater } = require("../models/theater");
const { Movie } = require("../models/movie");
const { Comment } = require("../models/comment");
const { default: mongoose } = require("mongoose");

movieRouter.get("/", async (req, res) => {
    const { isGrade } = req.query;
    if (isGrade != 0) {
        const movies = await Movie.find({},
            "contents.name contents.poster scores.bookingRate scores.avgPoint")
            .sort({ 'scores.bookingRate': 1 });
        return res.send({ movies });
    } else {
        const movies = await Movie.find({},
            "contents.name contents.poster scores.bookingRate scores.avgPoint")
            .sort({ 'scores.avgPoint': 1 });
        return res.send({ movies });
    }
})

movieRouter.get("/detail-view", async (req, res) => {
    const { movie_id } = req.query;
    const comment = await Comment.find({ movie: movie_id }, "comment point")
    .populate('member', 'name');
    const avgPointStorage = await Comment.aggregate([
        {
            '$match': { 'movie' : mongoose.Types.ObjectId(movie_id)}
        },
        {
            '$group': {
                '_id': 'null',
                'pointSum': { '$sum': '$point' },
                'pointTotal': { '$sum': 1 },
            }
        },
        {
            '$project': {
                'avgPoint': { '$divide': ['$pointSum', '$pointTotal'] },
            }
        }
    ]);
    console.log(avgPointStorage[0].avgPoint);
    const movie = await Movie.findByIdAndUpdate(
        movie_id,
        { $set: {scores:{avgPoint : avgPointStorage[0].avgPoint}} },
        { new: true },
    );
    return res.send({ movie, comment });
})

movieRouter.post("/detail-view", async (req, res) => {
    try {
        const commentInsert = new Comment(req.body);
        await commentInsert.save();
        return res.send({ commentInsert });
    } catch (err) {
        console.log(err)
        return res.status(400).send({ err: err.message });
    }
})

movieRouter.put("/detail-view", async (req, res) => {
    try {
        const { comment, point, movie, member } = req.body;
        const commentUpdate = await Comment.updateOne(
            { $and: [{ movie: movie }, { member: member }]},
            { $set: { comment: comment ,  point: point }}
        );
        return res.send({ commentUpdate });
    } catch (err) {
        console.log(err)
        return res.status(400).send({ err: err.message });
    }
})

movieRouter.delete("/detail-view", async (req, res) => {
    try {
        const { movie, member } = req.body;
        const commentDelete = await Comment.deleteOne(
            { $and: [{ movie: movie }, { member: member }] }
        );
        return res.send({ commentDelete });
    } catch (err) {
        console.log(err)
        return res.status(404).send({ err: err.message });
    }
})

module.exports = movieRouter;