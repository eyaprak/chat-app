const User = require('../models/User')
const Chat = require('../models/Chat')
const bcrypt = require('bcrypt')
const getIndex = (req, res) => {
    //console.log(req.session.user);
    Chat.find({})
        .then((chatData) => {
            res.render('index', {
                title: "Homepage",
                chatData: chatData,
                isAuthenticated: req.session.isAuthenticated,
                userName: req.session.user.name
            })
        }).catch((err) => { console.log(err) })
}

const getLogin = (req, res) => {
    if (!req.session.isAuthenticated || req.session.isAuthenticated == "") {
        res.render('login', {
            title: "Login",
            action: req.query.action
        })
    } else {
        res.redirect('/')
    }
}

const postLogin = (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({ email: email })
        .then(user => {
            if (user) {
                bcrypt.compare(password, user.password, function (err, result) {
                    if (result) {
                        req.session.isAuthenticated = true;
                        req.session.user = user;
                        res.redirect('/')
                    } else {
                        res.redirect('/login?action=error')
                    }
                });
            } else {
                res.redirect('/login?action=error',)
            }
        }).catch((err) => { console.log(err) })
}

const getRegister = (req, res) => {
    res.render('register', { title: 'Register', action: req.query.action })
}

const postRegister = (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({ email: email })
        .then(user => {
            if (user) {
                res.redirect('/register?action=error')
            } else {
                bcrypt.hash(password, 12, function (err, hashedPassword) {
                    if (!err) {
                        const userData = new User({ name, email, password: hashedPassword });
                        userData.save()
                            .then(() => {
                                console.log("Giriş başarılı");
                                res.redirect('/login?action=success')
                            }).catch((err) => { console.log(err) })
                    }
                })
            }
        }).catch((err) => { console.log(err) })

}

const postLogout = (req, res) => {
    req.session.destroy();
    res.redirect('/login')
}

module.exports = {
    getIndex,
    getLogin,
    postLogin,
    getRegister,
    postRegister,
    postLogout
}
