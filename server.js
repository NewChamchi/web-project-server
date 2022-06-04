const express = require("express");
const app = express();
const mongoose = require("mongoose");
const mainRouter = require("./routers/mainRouter");
const hostname = "127.0.0.1";
const port = 3000;
const DB_URI = "mongodb://127.0.0.1:27017/testdb2";
mongoose.connect(DB_URI);

const server = async () => {
    try {
        await mongoose.connect(DB_URI);
        app.use(express.json());
        app.use(mainRouter);
        app.listen(port, hostname, function () {
            console.log("server is running");
        });
    } catch (err) {
        console.log(err);
    }
};
server();
