const {startServer} = require('../server')
const mongoose = require('mongoose')
const {Course} = require('../models/course')
const User = require('../models/user')
const {Task} = require('../models/task')
const helpers = require('./testHelpers')
const config = require('../config')
const { userCreateQuery, createSpesificUserQuery } = require('./userTestQueries')
let server = null
beforeAll(async () => {
    server = await startServer()
    
    await mongoose.connect(config.MONGODB_URI)
    await Course.deleteMany({})
    await User.deleteMany({})
    await helpers.makeQuery({query: userCreateQuery, variables: {}})
    await helpers.makeQuery({query: createSpesificUserQuery, variables:{username: "students username", name: "students name", password: "12345"}})
})

afterAll(async () => {
    await server.apolloServer.stop();
    await server.httpServer.close();
    await Course.deleteMany({})
    await User.deleteMany({})
    await mongoose.connection.close()
})

beforeEach(async () => {
    await Course.deleteMany({})
    await Task.deleteMany({})
    helpers.logOut()
})

