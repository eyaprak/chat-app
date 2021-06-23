const express = require('express')
const router = express.Router();

const adminController = require('../controllers/adminController')
const isAuthenticated = require('../middlewares/authentication')

router.get('/', isAuthenticated, adminController.getIndex)

router.get('/login', adminController.getLogin)

router.post('/login', adminController.postLogin)

router.get('/register', adminController.getRegister)

router.post('/register', adminController.postRegister)

router.post('/logout', adminController.postLogout)



module.exports = router;