require('dotenv').config()

//this secret is also ONLY for local testing
const SECRET = process.env.NODE_ENV === 'test:local' ? "This secret is only for local testing" : process.env.SECRET

const PORT = process.env.PORT || 4000

const getCurrentUrlForEnvironment = () => {
    switch(process.env.NODE_ENV){
        case 'production':
            return process.env.MONGODB_URI
        case 'development':
            return process.env.MONGODB_URI
        case 'test':
            return process.env.MONGODB_URI_TEST
        case 'test:local':
            return 'mongodb://0.0.0.0:8000'
    }
}

const MONGODB_URI = getCurrentUrlForEnvironment()

const IS_TEST = process.env.NODE_ENV === 'test' ? true : false

const LOCAL_SERVER_URL = "http://localhost:4000/"

module.exports = {SECRET, PORT, MONGODB_URI, IS_TEST, LOCAL_SERVER_URL}