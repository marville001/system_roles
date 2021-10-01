"use strict";
require('dotenv').config()
const express = require("express")
const app = express();
const cors = require("cors");
const config = require("./config");

//Import Routes
const usersRoute = require("./routes/users")
const authRoute = require("./routes/auth")

app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(cors())

// Routes
app.use("/api/users", usersRoute);
app.use("/api/auth", authRoute);

app.get('/', (req, res) => {
    res.send({ status: "Ok", message: "Welcome to API" });
})

const PORT = config.port;
app.listen(PORT, () => console.log(`Server running on localhost ${PORT}`))