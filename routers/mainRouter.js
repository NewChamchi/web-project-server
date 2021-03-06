const express = require("express");
const { Member } = require("../models/member");
const mainRouter = express.Router();
const { Movie } = require("../models/movie");
const { Ticketing } = require("../models/ticketing");
userRouter = require("./userRouter");
movieRouter = require("./movieRouter");
theaterRouter = require("./theaterRouter");

mainRouter.use("/user", userRouter);
mainRouter.use("/movie", movieRouter);
mainRouter.use("/theater", theaterRouter);

mainRouter.get("/", async (req, res) => {
    console.log(req.query);
    const movies = await Movie.find({},
        "_id contents.name contents.poster scores.bookingRate scores.avgPoint")
        .sort({'scores.bookingRate' : -1});
    // const movies = await Movie.aggregate([
    //     { '$unwind': '$ticketings' },
    //     {
    //         '$lookup': {
    //             from: 'ticketings',
    //             localField: "ticketings",
    //             foreignField: '_id',
    //             as: "ticketing"
    //         }
    //     },
    //     { '$unwind': '$ticketing' },
    //     { '$unwind': '$ticketing.seats' }, // unwind는 배열 안의 배열은 못 꺼냄
    //     {
    //         '$group': {
    //             '_id': {
    //                 'name': '$name',
    //                 'poster': '$poster',
    //                 'comments': '$comments',
    //             },
    //             'seatCount' : {'$sum': '$ticketing.seats.count'},
    //             'seatTotal' : {'$sum': 1},
    //         }
    //     },
    //     {
    //         '$project' :{
    //             'name' : 1, 'poster' : 1, 'comments' : 1,
    //             'bookingRate' : {'$divide': ['$seatCount', '$seatTotal']},
    //         }
    //     },
    //     { '$unwind': '$_id.comments'},
    //     {
    //         '$group': {
    //             '_id': {
    //                 'name': '$_id.name',
    //                 'poster': '$_id.poster',
    //                 'bookingRate': '$bookingRate',
    //             },
    //             'pointSum' : {'$sum': '$_id.comments.point'},
    //             'pointTotal' : {'$sum': 1},
    //         }
    //     },
    //     {
    //         '$project': {
    //             'name' : 1, 'poster': 1, 'bookingRate': 1,
    //             'avgPoint' : { '$divide': [ '$pointSum', '$pointTotal']}
    //         }
    //     },
    //     {
    //         '$sort': { 'bookingRate': -1 }
    //     }
    // ]);
    return res.send({ movies });
});

mainRouter.get('/logout', async (req, res) =>{
    const session = req.session;
    try {
        if (session.user_id) { // 세션 정보가 존재하는 경우
            await req.session.destroy( (err) => {
                if (err) {
                console.log(err);
                return res.send({
                    result : "destory error"
                });
                } 
            })
        }
    } catch (e) {
        console.log(e);
    }
    return res.send({
        result : "noError"
    });
});

mainRouter.get('/get_login_id', async(req, res) => {
    const session = req.session;
    console.log(session);
    if (!session.user_id) {
        return res.send({
            islogin : false,
            message : "현재 로그인 상태가 아닙니다."
        })
    } else {
        member = await Member.find({id : session.user_id}, "_id id name");
        return res.send({
            islogin : true,
            member
        })
    }
});

mainRouter.post('/post_seats', async (req, res) => {
    try {
        const seatInsert = new Seat(req.body);
        await seatInsert.save();
        return res.status(200).json({
            success: true
        });
    } catch (err) {
        console.log(err)
        return res.status(400).send({ err: err.message });
    }
});

// mainRouter.post("/", async(req, res) => {
//     try {
//         const movie = new Movie(req.body);
//         await movie.save();
//         return res.send({ movie });
//     }
//     catch (err) {
//         console.log(err);
//         return res.status(400).send({ err: err.message });
//     }
// });

module.exports = mainRouter;