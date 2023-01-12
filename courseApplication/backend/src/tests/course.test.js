const {server, apolloServer} = require('../server')
const Course = require('../models/course')

beforeAll(async () => {
    await server.start("test server ready")
    await Course.deleteMany({})
})

afterAll(async () => {
    await Course.deleteMany({})
    await server.stop()
})

describe('course tests', () => {
    describe('course creation tests', () => {
        test('course can be created with correct parameters', () => {
            console.log("to be done")
        })
    })
})