const express = require("express");
const app = express();
const session = require('express-session');
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
const config = require('./config/key');
const mainRouter = require("./routers/mainRouter");
const hostname = "127.0.0.1";
const port = 8080;
// const DB_URI = "mongodb://127.0.0.1:27017/testdb2";

mongoose.connect(config.mongoURI)
    .then(()=>console.log('MongoDB Connected...'))
    .catch(err => console.log(err))


const server = async () => {
    try {
        // await mongoose.connect(DB_URI);
        app.use(express.json());
        app.use(session({
            secret: "@XF!SF!$SDAFZ%#$@",
            resave: false,
            saveUninitialized: false,
            store: MongoStore.create({mongoUrl:config.mongoURI}), // session 저장 장소(mongoose를 이용하여 mongoDB로 설정)
            cookie:{maxAge:(3.6e+6)*24} // 24시간 뒤 만료(자동 삭제)
        }));
        app.use(mainRouter);
        app.listen(port, hostname, function () {
            console.log("server is running");
        });
    } catch (err) {
        console.log(err);
    }
};
server();
