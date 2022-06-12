const express = require("express");
const theaterRouter = express.Router();
const { Member } = require("../models/member");
const { Ticketing } = require("../models/ticketing");
const { Theater } = require("../models/theater");
const { Movie } = require("../models/movie");
const { Seat } = require("../models/seat");
const { default: mongoose } = require("mongoose");

theaterRouter.get("/", async (req, res) => {
    const theater = await Theater.find({}, "name floor totalSeatCount")
        .populate({ path: 'ticketings', populate: { path: 'movie', select: 'contents.name' }, select: 'startTime bookingSeatCount' });
    return res.send({ theater });
})

theaterRouter.get("/ticket", async (req, res) => {
    const movie = await Movie.find({ticketings: { $exists: true }}, "contents.name contents.ageLimit")
    return res.send({ movie });
})

theaterRouter.get("/ticket/:movie_id", async (req, res) => {
    const { movie_id } = req.params;
    const movie = await Movie.find({ id: movie_id }, "_id")
        .populate({
            path: 'ticketings',
            populate: { path: 'theater', select: "name floor totalSeatCount" },
            select: "startTime bookingSeatCount"
        });
    return res.send({ movie });
})

theaterRouter.get("/ticket/seat/:ticketing_id", async (req, res) => {
    const { ticketing_id } = req.params;
    const seats = await Seat.find({ ticketing: ticketing_id }, "name position isBooked")
        .populate({
            path: 'ticketing',
            populate: { path: 'theater', select: 'name floor totalSeatCount' },
            select: 'startTime bookingSeatCount'
        });
    // const SeatCountStorage = await Seat.aggregate([
    //     {
    //         '$match': { 'ticketing': mongoose.Types.ObjectId(ticketing_id) }
    //     },
    //     {
    //         '$group': {
    //             '_id': 'null',
    //             'bookingSeatCount': { '$sum': '$isBooked' },
    //             'totalSeatCount': { '$sum': 1 },
    //         }
    //     }
    // ]);
    // console.log(SeatCountStorage[0].bookingSeatCount);
    // console.log(SeatCountStorage[0].totalSeatCount);
    // const movieIdStorage = await Seat.aggregate([
    //     {
    //         '$lookup': {
    //             from: 'ticketings',
    //             localField: 'ticketing',
    //             foreignField: '_id',
    //             as: 'ticketing_info'
    //         }
    //     },
    //     { '$unwind': '$ticketing_info' },
    //     {
    //         '$group': {
    //             '_id': {
    //                 'movie': '$ticketing_info.movie',
    //             },

    //         }
    //     },
    //     {
    //         '$project': {
    //             'movie_id': '$_id.movie'
    //         }
    //     }
    // ])
    // console.log(movieIdStorage[0].movie_id);
    // const bookingRateStorage = await Seat.aggregate([
    //     {
    //         '$lookup': {
    //             from: 'ticketings',
    //             localField: 'ticketing',
    //             foreignField: '_id',
    //             as: 'ticketing_info'
    //         }
    //     },
    //     { '$unwind': '$ticketing_info' },
    //     {
    //         '$match': { 'ticketing_info.movie': mongoose.Types.ObjectId(movieIdStorage[0].movie_id) }
    //     },
    //     {
    //         '$group': {
    //             '_id' : 'null',
    //             'bookingSeatCount': { '$sum': '$isBooked' },
    //             'totalSeatCount': { '$sum': 1 },
    //         }
    //     },
    //     {
    //         '$project': {
    //             'bookingRate': {'$multiply': [{'$divide': ['$bookingSeatCount', '$totalSeatCount']}, 100]}
    //         }
    //     }
    // ])
    // console.log(bookingRateStorage[0].bookingRate)
    // const ticketingUpdate = await Ticketing.updateOne(
    //     {_id: ticketing_id},
    //     {$set: {bookingSeatCount: SeatCountStorage[0].bookingSeatCount}}
    // )
    // const theaterUpdate = await Theater.updateOne(
    //     {ticketings: {$elemMatch:{$eq:mongoose.Types.ObjectId(ticketing_id)}}},
    //     {$set: {totalSeatCount: SeatCountStorage[0].totalSeatCount}}
    // )
    // const movieUpdate = await Movie.updateOne(
    //     {_id: movieIdStorage[0].movie_id},
    //     {$set: {bookingRate: bookingRateStorage[0].bookingRate}}
    // )
    return res.send({ seats });
})

theaterRouter.put("/ticket/seat/:ticketing_id", async (req, res) => {
    try {
        const { ticketing_id } = req.params;
        const { nameArray, member, isBooked } = req.body;
        const seatUpdate = await Seat.updateMany(
            { $and: [{ name: { $in: nameArray } }, { ticketing: ticketing_id }] },
            { $set: { member: member, isBooked: isBooked } }
        )
        const SeatCountStorage = await Seat.aggregate([
            {
                '$match': { 'ticketing': mongoose.Types.ObjectId(ticketing_id) }
            },
            {
                '$group': {
                    '_id': 'null',
                    'bookingSeatCount': { '$sum': '$isBooked' },
                    'totalSeatCount': { '$sum': 1 },
                }
            }
        ]);
        console.log(SeatCountStorage[0].bookingSeatCount);
        console.log(SeatCountStorage[0].totalSeatCount);
        const movieIdStorage = await Seat.aggregate([
            {
                '$lookup': {
                    from: 'ticketings',
                    localField: 'ticketing',
                    foreignField: '_id',
                    as: 'ticketing_info'
                }
            },
            { '$unwind': '$ticketing_info' },
            {
                '$group': {
                    '_id': {
                        'movie': '$ticketing_info.movie',
                    },
    
                }
            },
            {
                '$project': {
                    'movie_id': '$_id.movie'
                }
            }
        ])
        console.log(movieIdStorage[0].movie_id);
        const bookingRateStorage = await Seat.aggregate([
            {
                '$lookup': {
                    from: 'ticketings',
                    localField: 'ticketing',
                    foreignField: '_id',
                    as: 'ticketing_info'
                }
            },
            { '$unwind': '$ticketing_info' },
            {
                '$match': { 'ticketing_info.movie': mongoose.Types.ObjectId(movieIdStorage[0].movie_id) }
            },
            {
                '$group': {
                    '_id' : 'null',
                    'bookingSeatCount': { '$sum': '$isBooked' },
                    'totalSeatCount': { '$sum': 1 },
                }
            },
            {
                '$project': {
                    'bookingRate': {'$multiply': [{'$divide': ['$bookingSeatCount', '$totalSeatCount']}, 100]}
                }
            }
        ])
        console.log(bookingRateStorage[0].bookingRate)
        const ticketingUpdate = await Ticketing.updateOne(
            {_id: ticketing_id},
            {$set: {bookingSeatCount: SeatCountStorage[0].bookingSeatCount}}
        )
        const theaterUpdate = await Theater.updateOne(
            {ticketings: {$elemMatch:{$eq:mongoose.Types.ObjectId(ticketing_id)}}},
            {$set: {totalSeatCount: SeatCountStorage[0].totalSeatCount}}
        )
        const movieUpdate = await Movie.updateOne(
            {_id: movieIdStorage[0].movie_id},
            {$set: {bookingRate: bookingRateStorage[0].bookingRate}}
        )
        return res.status(200).json({
            success : true
        });
    } catch (err) {
        console.log(err)
        return res.status(400).send({ err: err.message });
    }
})
module.exports = theaterRouter;