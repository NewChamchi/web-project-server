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
    if (isGrade == 0) {
        const movies = await Movie.find({},
            "_id contents.name contents.poster contents.release scores.bookingRate scores.avgPoint")
            .sort({ 'scores.bookingRate': -1 });
        return res.send({ movies });
    } else {
        const movies = await Movie.find({},
            "_id contents.name contents.poster contents.release scores.bookingRate scores.avgPoint")
            .sort({ 'scores.avgPoint': -1 });
        return res.send({ movies });
    }
})

movieRouter.get("/detail-view", async (req, res) => {
    const { movie_id } = req.query;
    const comment = await Comment.find({ movie: movie_id }, "_id comment point recommendCount")
        .populate('member', '_id name');
    var avgPoint;
    if (comment[0] == undefined) {
        console.log(comment[0]);
        avgPoint = 0;
    } else {
        const avgPointStorage = await Comment.aggregate([
            {
                '$match': { 'movie': mongoose.Types.ObjectId(movie_id) }
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
        avgPoint = avgPointStorage[0].avgPoint;
    }
    const movie = await Movie.findByIdAndUpdate(
        movie_id,
        { $set: { scores: { avgPoint: avgPoint } } },
        { new: true },
    );
    return res.send({ movie, comment });
})

movieRouter.post("/detail-view", async (req, res) => {
    try {
        const { movie_id } = req.query;
        const commentInsert = new Comment(req.body);
        await commentInsert.save();
        const avgPointStorage = await Comment.aggregate([
            {
                '$match': { 'movie': mongoose.Types.ObjectId(movie_id) }
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
        const movieUpdate = await Movie.findByIdAndUpdate(
            movie_id,
            { $set: { scores: { avgPoint: avgPointStorage[0].avgPoint } } },
            { new: true },
        );
        return res.status(201).json({
            success: true, 
            commentInsert
        });
    } catch (err) {
        console.log(err)
        return res.status(400).send({ err: err.message });
    }
})

movieRouter.put("/detail-view", async (req, res) => {
    try {
        const { comment, point, movie, member } = req.body;
        const commentUpdate = await Comment.updateOne(
            { $and: [{ movie: movie }, { member: member }] },
            { $set: { comment: comment, point: point } }
        );
        const avgPointStorage = await Comment.aggregate([
            {
                '$match': { 'movie': mongoose.Types.ObjectId(movie) }
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
        const movieUpdate = await Movie.findByIdAndUpdate(
            movie,
            { $set: { scores: { avgPoint: avgPointStorage[0].avgPoint } } },
            { new: true },
        );
        return res.status(200).json({
            success: true,
            commentUpdate
        });
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
        const comment = await Comment.find({ movie: movie }, "comment point")
            .populate('member', 'name');
        var avgPoint;
        if (comment[0] == undefined) {
            console.log(comment[0]);
            avgPoint = 0;
        } else {
            const avgPointStorage = await Comment.aggregate([
                {
                    '$match': { 'movie': mongoose.Types.ObjectId(movie_id) }
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
            avgPoint = avgPointStorage[0].avgPoint;
        }
        const movieUpdate = await Movie.findByIdAndUpdate(
            movie,
            { $set: { scores: { avgPoint: avgPoint } } },
            { new: true },
        );
        return res.status(200).json({
            success: true
        });
    } catch (err) {
        console.log(err)
        return res.status(404).send({ err: err.message });
    }
})

// 추천 안돼있을 때 추천하는 기능
movieRouter.put('/recommended', async (req, res) => {
    try {
        const { comment_id, member_id } = req.query;
        const commentUpdateFirst = await Comment.UpdateOne(
            { _id: comment_id }, // 조건 (if id == commentid)
            { $addToSet: { recommendMember: member_id } } // 행동 
        )
        // 하나의 도큐먼트 생성
        const recommendCountStore = await Comment.aggregate([ // 집계식?
            {   
                '$match': { '_id': mongoose.Types.ObjectId(comment_id) } // id = commentid 
            },
            {
                '$unwind': '$recommendMember'
            },
            {
                '$count': 'recommendCount'
            }
        ])

        // 업데이트 -> 위에서 생성한 도큐먼트를 업뎃
        const commentUpdateSecond = await Comment.UpdateOne(
            { _id: comment_id },
            { $set: { recommendCount: recommendCountStore.recommendCount } } 
        )
        return res.status(200).json({
            success: true
        });
    } catch (err) {
        console.log(err)
        return res.status(400).send({ err: err.message });
    }
});

// 추천 돼있을 때 추천 취소하는 기능
// 그냥 쿼리만 보내라 , 근데 해당 댓글을 추천했는지 로그인 된 사용자랑 추천된 사용자 리스트랑 
// 비교를 해서 존재하는지 확인하는 것 까지 짜기 
movieRouter.delete('/recommended', async (req, res) => {
    try {
        const { comment_id, member_id } = req.query;
        const commentUpdateFirst = await Comment.findByIdAndUpdate(
            comment_id,
            { $pull: { recommendMember: member_id } },
            { new: true }, // 업데이트 후 정보를 find하는 옵션
        )
        var recommendCountStore;
        if (commentUpdateFirst.recommendMember[0] == undefined) { // 추천한 사람이 없을 때
            console.log(commentUpdateFirst.recommendMember[0]);
            recommendCountStore = 0; // 추천수는 0
        } else {
            recommendCountStore = await Comment.aggregate([ // 추천한 사람이 있으면 계산
                {
                    '$match': { '_id': mongoose.Types.ObjectId(comment_id) }
                },
                {
                    '$unwind': '$recommendMember'
                },
                {
                    '$count': 'recommendCount'
                }
            ])
        }
        const commentUpdateSecond = await Comment.UpdateOne(
            { _id: comment_id },
            { $set: { recommendCount: recommendCountStore.recommendCount } }
        )
        return res.status(200).json({
            success: true
        });
    } catch (err) {
        console.log(err)
        return res.status(400).send({ err: err.message });
    }
})

movieRouter.get('/recommended', async (req, res) => {
    const { comment_id } = req.query;
    const recommendMemberArray = await Comment.find({_id: comment_id}, "recommendMember");
    return res.send({ recommendMemberArray });
});
module.exports = movieRouter;