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

const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID

const GOOGLE_CREATE_ACCOUNT_SECRET = process.env.GOOGLE_CREATE_ACCOUNT_SECRET

module.exports = {SECRET, PORT, MONGODB_URI, IS_TEST, LOCAL_SERVER_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CREATE_ACCOUNT_SECRET}