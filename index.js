
const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
connectDB = require("./config/db");
const http = require('http').createServer(app);


const db = connectDB();
// const server = http.createServer(app);
app.use(express.json);
const io = require('socket.io')(http, {
    cors: {
      origin: "*"
    }
  });
// var io = require("socket.io")(server);
const carrom = require("./model/room")

function sleep(ms) {
    return new Promise((resolve) => {
        // console.log("sleep call ho rha hai")
        setTimeout(resolve, ms);
    });
}

io.on('connection', (socket) => {

    console.log("socket conected ", socket.id)
    socket.on("joinRoom", async (body) => {
        console.log("hiiiiiiiii from join");
     
        const playerId = body.playerId
        const name = body.name
        var totalCoin = body.totalCoin;
        var profileImageUrl = body.profileImageUrl;
        var playerStatus = body.playerStatus;
        var coin = body.coin
        console.log("playercoin",coin);
        const all = await carrom.find()
        var roomId = " "
        all.every(element => {
            if (element.isJoin == true) {
                roomId = element._id.toString();
                return false;
            }
            return true;
        });

        if (roomId == " ") {

            var room = new carrom()

            const player = {
                socketID: socket.id,
                playerId: playerId,
                name: name,
                playerType: 'Real Player',
                totalCoin: totalCoin,
                profileImageUrl: profileImageUrl,
                playerStatus: playerStatus,
            }
            room.coin = coin
            room.players.push(player)

            room.turn = player;


            room = await room.save();

            roomId = room._id.toString();

            socket.join(roomId);

            socket.emit('createRoomSuccess', room);


        } else {

            room = await carrom.findById(roomId)

            if (room.isJoin) {
                if (room.coin == coin) {
                    const player = {
                        socketID: socket.id,
                        playerId: playerId,
                        name: name,
                        playerType: 'Real Player',
                        totalCoin: totalCoin,
                        profileImageUrl: profileImageUrl,
                        playerStatus: playerStatus,
                    }
                    room.players.push(player)
                    socket.join(roomId);
                    if (room.players.length = room.occupancy) {
                        room.isJoin = false;
                        io.to(roomId).emit("startGame", { playerId: room.players[1].playerId })
                    }

                    room = await room.save();

                    io.to(roomId).emit('updatedPlayers', room.players);
                    socket.emit('updatedPlayer', player);
                    io.to(roomId).emit('updatedRoom', room);
                    io.to(roomId).emit('roomMessage', `${name} has joined the room.`);
                } else {
                    var room = new carrom()

                    const player = {
                        socketID: socket.id,
                        playerId: playerId,
                        name: name,
                        playerType: 'Real Player',
                        totalCoin: totalCoin,
                        profileImageUrl: profileImageUrl,
                        playerStatus: playerStatus,
                    }
                    room.coin = coin
                    room.players.push(player)

                    room.turn = player;


                    room = await room.save();

                    roomId = room._id.toString();

                    socket.join(roomId);

                    socket.emit('createRoomSuccess', room);
                }
            } else {
                socket.emit('errorOccured', 'Sorry! The Room is full. Please try again.');
                return;
            }

        }

    })

    socket.on("start", async (body) => {
        const roomId = body.roomId
        var room = await carrom.findById(roomId)
        const playerList = []
        playerList.push(room.players[0].playerId)
        playerList.push(room.players[1].playerId)
        // io.emit("playerTurn", { playerId: playerList[0] })
        room.currentStriker = room.players[0].playerId
        console.log(room.players[0].playerId, "LLLLLLLLLLLLLLLLLLLLLLLLLLL")
        room = await room.save()
        var endLoop = false
        // io.to(roomId).emit("currentStriker", { playerId: room.players[0].playerId})
        do {
            const playerTurn = async (playerId) => {
                console.log(playerId, room.players[0].playerId)
                io.to(roomId).emit("currentStriker", { playerId: playerId })
                if (playerId === room.players[0].playerId) {

                    for (let i = 1; i > 0; i++) {
                        room = await carrom.findById(roomId)
                        var betFlag1 = false
                        // io.to(roomId).emit("timer", i)
                        await sleep(1000)
                        if(room.isLeftPLayer1==true){
                            break;
                        }
                        // console.log("enterkargiya player111111111111111111111")
                        console.log(room.players[0].strikeDone, "ppppppppppppp")
                        if (room.players[0].strikeDone == true) {
                            console.log("strikeDone player999999999999999999999999999y")
                            betFlag1 = true

                            room.players[0].strikeDone = false
                            room = await room.save()
                            break
                        }
                    }
                    if (betFlag1 == false) {
                        room.currentStriker = room.players[1].playerId
                        room = await room.save()
                    }
                } else {
                    for (let i = 1; i > 0; i++) {
                        var betFlag = false
                        await sleep(1000)
                        // io.to(roomId).emit("timer", i + 1)
                        console.log("enterkargiya player222222222")
                        if(room.isLeftPLayer2==true){
                            break;
                        }
                        console.log(room.players[1].strikeDone, "ppppppppppppp")
                        if (room.players[1].strikeDone == true) {

                            console.log("strikeDone player2")
                            betFlag = true
                            room.players[1].strikeDone = false
                            room = await room.save()
                            break
                        }
                    }
                    if (betFlag == false) {
                        room.currentStriker = room.players[0].playerId
                        room = await room.save()
                    }
                }

            }
            await sleep(1000)
                if (playerList.length > 1 && room.players.length>1) {
                await playerTurn(room.currentStriker)
            } else {
                io.to(roomId).emit("playerWon", { playerId: playerList[0] })
            }
            if ((room.queenCovered && room.whiteCount == 6) || (room.queenCovered && room.blackCount == 6)||(room.players.length==1)||(playerList.length==1)) {
                endLoop = true
            }

        } while (
            endLoop == false)

        console.log("end+++++++++++++", "")
    })

    socket.on("strike", async (body) => {
        let white = body.white
        let black = body.black
        let queen = body.queen
        let foul = body.foul
        let roomId = body.roomId
        let playerId = body.playerId
        let foulCount = body.foulCount
        let queenPocket = body.queenPocket

        // player1=white and player2=black 
        console.log(white, black, foul, foulCount, roomId, playerId, queen, queenPocket, "hiiiiiiiiiiiii")
        var room = await carrom.findById(roomId)
        // ++++++++++++++++++++++++player1 calculation ++++++++++++++++++

        if (room.players[0].playerId === playerId) {
            console.log("strikkkkkkeeee")
            room.players[0].strikeDone = true
            room = await room.save()
            // console.log(room.players[0].strikeDone, "jiiiiiiiiiiiiii")
            if (foul == true) {

                // if (queen == false) {

                if (white > 0) {
                    room.whiteCount = room.whiteCount - foulCount
                    room = await room.save()
                    if (room.whiteCount < 0) {
                        room.whiteCount = 0
                        room = await room.save()
                    }
                }
                if (black > 0) {
                    room.blackCount = room.blackCount + black
                    if (room.blackCount == 6) {
                        if (room.player2QueenCoverd == true) {
                            io.to(roomId).emit("playerWon", { playerId: room.players[1].playerId })
                        } else {
                            io.to(roomId).emit("coveredQueen", { status: false, playerId: room.players[1].playerId })
                            room.blackCount = room.blackCount - 1
                            room = await room.save()
                        }

                    }
                    room = await room.save()
                }
                if (queenPocket == true) {
                    io.to(roomId).emit("queenPocket", false)
                }
                io.to(roomId).emit("currentGoti", { black: room.blackCount, white: room.whiteCount })

              


            } else {
                 
                if (queen == true) {
                    console.log("+++++++++++++queen true enter++++++++++++++++")
                    room.player1QueenCoverd = true
                    if (white > 0) {
                        room.whiteCount += white
                    }
                    if (black > 0) {
                        room.blackCount += black
                    }
                    room = await room.save()
                    io.to(roomId).emit("queenCoverd", true)
                    io.to(roomId).emit("currentGoti", { black: room.blackCount, white: room.whiteCount })
                    if (room.whiteCount == 6) {
                        io.to(roomId).emit("playerWon", { playerId: playerId })
                    } else if (room.blackCount == 6) {
                        io.to(roomId).emit("playerWon", { playerId: room.players[1].playerId })
                    } else {
                        console.log("emitting player turn");
                        io.to(roomId).emit("playerTurn", { playerId: playerId })
                        room.currentStriker = playerId
                        room = await room.save()
                    }
                } else {
                    console.log("+++++++++++++queen false enter++++++++++++++++")
                    if (white > 0) {
                        room.whiteCount += white
                    }
                    if (black > 0) {
                        room.blackCount += black
                    }
                    if (queenPocket == true) {
                        io.to(roomId).emit("queenPocket", true)
                    }
                    room = await room.save()
                    if (white == 0) {
                        io.to(roomId).emit("playerTurn", { playerId: room.players[1].playerId })
                        room.currentStriker = room.players[1].playerId
                        room = await room.save()
                    } else if (room.whiteCount == 6) {
                        if (room.player1QueenCoverd == true) {
                            io.to(roomId).emit("playerWon", { playerId: playerId })
                        } else {
                            io.to(roomId).emit("coveredQueen", { status: false, playerId: playerId })
                        }
                    } else if (room.blackCount == 6) {
                        if (room.player2QueenCoverd == true) {
                            io.to(roomId).emit("playerWon", { playerId: room.players[1].playerId })
                        } 
                        io.to(roomId).emit("playerWon", { playerId: room.players[0].playerId })
                    }
                    else {
                        console.log("emitting player turn");
                        io.to(roomId).emit("playerTurn", { playerId: playerId })
                        room.currentStriker = playerId
                        room = await room.save()
                    }

                }
            }
        } else {
            // ++++++++++++++++++ 2nd player turn (black)+++++++++++++++++++++++++++
            if (room.players[1].playerId === playerId) {
                room.players[1].strikeDone = true
                room = await room.save()
                console.log(room.players[1].playerId, room.players[1].strikeDone)
                if (foul == true) {
                    // if (queen == false) {
                    if (white > 0) {
                        room.whiteCount = room.whiteCount + white
                        room = await room.save()
                        if (room.whiteCount == 6 && room.player1QueenCoverd == true) {
                            io.to(roomId).emit("playerWon", { playerId: room.players[0].playerId })
                        }
                    }
                    if (black > 0) {
                        room.blackCount = room.blackCount - foulCount
                        if (room.blackCount < 0) {
                            room.blackCount = 0
                        }
                        room = await room.save()
                    }

                    if (queenPocket == true) {
                        io.to(roomId).emit("queenPocket", false)
                    }
                    io.to(roomId).emit("currentGoti", { black: room.blackCount, white: room.whiteCount })

                    // }
                } else {
                    if (queen == true) {
                        if (white > 0) {
                            room.whiteCount += white
                        }
                        if (black > 0) {
                            room.blackCount += black
                        }
                        room = await room.save()
                        io.to(roomId).emit("queenCoverd", true)
                        io.to(roomId).emit("currentGoti", { black: room.blackCount, white: room.whiteCount })
                        if (room.whiteCount == 6) {
                            io.to(roomId).emit("playerWon", { playerId: playerId })
                        } else if (room.blackCount == 6) {
                            io.to(roomId).emit("playerWon", { playerId: room.players[0].playerId })
                        } else {
                            io.to(roomId).emit("playerTurn", { playerId: playerId })
                            room.currentStriker = playerId
                            room = await room.save()
                        }
                    } else {
                        if (white > 0) {
                            room.whiteCount += white
                        }
                        if (black > 0) {
                            room.blackCount += black
                        }
                        if (queenPocket == true) {
                            io.to(roomId).emit("queenPocket", true)
                        }
                        room = await room.save()
                        if (black == 0) {
                            io.to(roomId).emit("playerTurn", { playerId: room.players[0].playerId })
                            room.currentStriker = room.players[0].playerId
                            room = await room.save()
                        } else {
                            io.to(roomId).emit("playerTurn", { playerId: playerId })
                            room.currentStriker = playerId
                            room = await room.save()
                        }

                    }
                }


            }

        }

    })

    socket.on("clearAll", async () => {
        // const roomId=body.roomId
        await carrom.deleteMany({})

    })   

    socket.on("clear", async (body) => {
        const roomId = body.roomId
        await carrom.deleteOne({ _id: roomId })
    })

    socket.on("leaveRoom", async (body) => {
        let roomId = body.roomId;
        let playerId = body.playerId;
        let room = await carrom.findById({ id: roomId })
        const playerIndex = room.players.indexOf((player) => {
            player.playerId == playerId
        })
        if (playerIndex == 0) {
            room.isLeftPLayer1 = true
        } else {
            room.isLeftPLayer2 = true
        }
        room = await room.save()
        io.to(roomId).emit("roomLeftPlayerId", { playerId: playerId })
        room.players = room.players.filter((player) => {
            return player.playerId != playerId
        })
        room = await room.save()

    })

    socket.on("disconnect", () => {
        console.log("disconnected")
    })
    
}) 

http.listen(3000, () => {
    console.log('listening on *:3000');
  });
