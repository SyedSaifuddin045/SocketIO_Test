const mongoose = require("mongoose");

const playerSchema = require("./player");

const roomSchema = new mongoose.Schema({
    occupancy: {
        type: Number,
        default: 2,
    },
  queenCovered:{
    type:Boolean,
    default:false
  },
    players: [playerSchema],
    isJoin: {
        type: Boolean,
        default: true,
    },
    disconnect: {
        type: Boolean,
        default: false
    },
    currentStriker:{
      type:String      
    },
    whiteCount:{
      type:Number,
      default:0
    },
    blackCount:{
      type:Number,
      default:0
    },
    playerList:{
      type:Array,
      default:[]
    },

  coin:{
    type:Number,
  },
  player1QueenCoverd:{
    type:Boolean,
    default:false
  },
  player2QueenCoverd:{
    type:Boolean,
    default:false
  },
  isLeftPLayer1:{
    type:Boolean,
    default:false
  },
  isLeftPLayer2:{
    type:Boolean,
    default:false
  },

   
    


}, { versionKey: false });
module.exports = mongoose.model("carrom", roomSchema);