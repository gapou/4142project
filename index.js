require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const app = express()

require('dotenv').config()

mongoose.connect('mongodb://localhost:27017/blockchains', (err) => {
    if(err){
        return console.log("cannot connect to DB")
    }
    console.log("Database is connected")
    connectionCallBack()
});

let chain = require('./buildChain')
console.log(chain)

let connectionCallBack = () => {}

app.use(express.json())

const blockchainRouter = require('./routes/blockchains')
app.use('./blockchains',blockchainRouter)
app.listen(27017, () => console.log('Server Started'))
