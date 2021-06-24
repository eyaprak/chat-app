const express = require('express')
const http = require('http')
const socketio = require('socket.io')

const mongoose = require('mongoose');
const adminRouter = require('./routers/adminRouter')
const bodyParser = require('body-parser')
const session = require('express-session');
const mongoDbStore = require('connect-mongodb-session')(session);

const app = express()
const server = http.createServer(app)
const io = socketio(server);

const Chat = require('./models/Chat');

const config = require('./config.json');

const {
    userJoin,
    userLeave,
    getUsers
} = require('./views/utils/users');


app.set('view engine', 'ejs');
app.use(express.static('public'))


const port = process.env.PORT || 3000



//app.use(express.bodyParser());
app.use(bodyParser.urlencoded({ extended: false }))


mongoose.connect(config.mongoDBConnectionString, {
    useNewUrlParser: "true",
    useUnifiedTopology: "true"
})
mongoose.connection.on("error", err => {
    console.log("err", err)
})


var store = new mongoDbStore({
    uri: config.mongoDBConnectionString,
    collection: 'mySessions'
})

app.use(session({
    secret: 'chatappsecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 3600000
    },
    store: store
}))

app.use(adminRouter)




app.use((req, res) => {
    if (!req.session.isAuthenticated) {
        return res.redirect('/login')
    }
    res.status(404).render('404')
})


mongoose.connection.on("connected", (err, res) => {
    if (!err) {
        server.listen(port, () => {
            console.log("baglanti ok 3000 port dinleniyor")

            //connect client
            io.on('connection', socket => {


                socket.on('joinRoom', (username, sessionid) => {
                    const user = userJoin(socket.id, username, sessionid)

                    socket.broadcast.emit("roomMessage", user.username + " joined the chat room.");
                    io.emit('roomUsers', { users: getUsers() })

                })


                sendStatus = function (s) {
                    socket.emit('status', s)
                }

                Chat.find().limit(100).sort({ _id: 1 }).exec(function (err, res) {
                    if (err) {
                        throw err;
                    }

                    // Emit the messages
                    socket.emit('output', res);
                })

                //Handle input events
                socket.on('input', function (data) {
                    let name = data.name
                    let message = data.message;
                    const date = new Date()
                    const dateTime = date.getTime()

                    //Check for name and message
                    if (name == '' || message == '') {
                        //Send error status
                        sendStatus('Please enter a name and message');

                    } else {
                        const chat = new Chat({ name, message, sentTime: dateTime });
                        chat.save()
                            .then(() => {
                                io.emit('output', [data])
                                //send status object
                                sendStatus({
                                    message: 'Message sent',
                                    clear: true
                                });
                                socket.broadcast.emit("playMessageSound");
                            })
                    }
                });

                //Handle clear
                socket.on('clear', function () {
                    //Remove all chats from collection
                    Chat.deleteMany({}, function () {
                        //Emit cleared
                    });
                    socket.broadcast.emit('cleared')
                })


                socket.on('disconnect', () => {
                    const user = userLeave(socket.id);

                    if (user) {
                        io.emit('roomMessage', `${user.username} has left the chat.`)
                    }

                    io.emit('roomUsers', { users: getUsers() })

                })

            })

        })
    } else {
        console.log(err)
    }

})
