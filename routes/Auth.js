const express = require('express')
const router = express.Router()
const {login,logout,register,refresh_token} = require('../controllers/Auth')


router.post('/login', login)
router.post('/register', register)
router.post('/refresh_token', refresh_token)
router.delete('/logout', logout)

module.exports = router
