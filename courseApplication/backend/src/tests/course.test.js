const {server, apolloServer} = require('../server')
const Course = require('../models/course')
const User = require('../models/user')
const { userCreateQuery } = require('./userTestQueries')
const { createCourse } = require('./courseTestQueries')

beforeAll(async () => {
    await server.start("test server ready")
    await Course.deleteMany({})
    await User.deleteMany({})
    await apolloServer.executeOperation({query: userCreateQuery, variables:{}})
})

afterAll(async () => {
    await Course.deleteMany({})
    await User.deleteMany({})
    await server.stop()
})

describe('course tests', () => {
    describe('course creation tests', () => {
        test('createCourse query returns correctly with correct parameters', async () => {
            const createdCourse = await apolloServer.executeOperation({query: createCourse, variables: {uniqueName: "uniqueName", name: "common name", teacher: "username"}})
            
            const correctReturnValue = {
                uniqueName: 'uniqueName',
                name: 'common name',
                teacher: {
                    username: 'username',
                    name: 'name'
                },
                students: []
            }
            expect(createdCourse.data.createCourse).toEqual(correctReturnValue)
        })
    })
})