const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
    playerName: {
        type: String,
    },
    playerId: {
        type: String,
        
    },
    socketID: {
        type: String,
    },
    wonCoin: {
        type: Number,
        default: 0,
    },
    totalCoin: {
        type: String,
    },
    profileImgUrl: {
        type: String,
        // required: true,
    },
    playerStatus: {
        type: String,
    },
    withdrawn: {
        type: Boolean,
        default: false
    },
    strikeDone: {
        type: Boolean,
        default: false
    },
 
    playersTurns: {
        type: Boolean,
        default: false
    },
    white:{
        type:Number,
        default:0
    },
    black:{
        type:Number,
        default:0
    }
 
});

module.exports = playerSchema;
