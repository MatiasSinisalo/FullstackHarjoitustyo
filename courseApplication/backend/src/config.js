require('dotenv').config()

const SECRET = process.env.SECRET

const PORT = process.env.PORT

const getCurrentUrlForEnvironment = () => {
    switch(process.env.NODE_ENV){
        case 'development':
            return process.env.MONGODB_URI
        case 'test':
            return process.env.MONGODB_URI_TEST
        case 'test:local':
            //only for connecting to localhost only mongodb server, this server MUST NOT be exposed to the internet
            return 'mongodb://localuser:localpass@localhost:8000'
    }
}

const MONGODB_URI = getCurrentUrlForEnvironment()

const IS_TEST = process.env.NODE_ENV === 'test' ? true : false


module.exports = {SECRET, PORT, MONGODB_URI, IS_TEST}