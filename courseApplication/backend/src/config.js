require('dotenv').config()

const SECRET = process.env.SECRET

const PORT = process.env.PORT

const MONGODB_URI = process.env.NODE_ENV === 'test' ? process.env.MONGODB_URI_TEST : process.env.MONGODB_URI

module.exports = {SECRET, PORT, MONGODB_URI}