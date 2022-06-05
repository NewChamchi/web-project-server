const express = require("express");
const mainRouter = express.Router();
const { Movie } = require("../models/movie");
userRouter = require("./userRouter");
movieRouter = require("./movieRouter");
theaterRouter = require("./theaterRouter");

mainRouter.use("/user", userRouter);
// mainRouter.use("/movie", moiveRouter);
// mainRouter.use("/theater", theaterRouter);

mainRouter.get("/", async (req, res) => {
    console.log(req.query);
    const movies = await Movie.find({}, "name poster bookingRate grade");
    return res.send({ movies });
});

mainRouter.post("/movie", async(req, res) => {
    try {
        const movie = new Movie(req.body);
        await movie.save();
        return res.send({ movie });
    }
    catch (err) {
        console.log(err);
        return res.status(400).send({ err: err.message });
    }
});



module.exports = mainRouter;