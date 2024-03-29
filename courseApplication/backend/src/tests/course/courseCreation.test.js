const {startServer} = require('../../server')
const request = require('supertest')
const {Course} = require('../../models/course')
const User = require('../../models/user')
const {Task} = require('../../models/task')
const { userCreateQuery, userLogInQuery, createSpesificUserQuery } = require('../userTestQueries')
const { createCourse, addStudentToCourse, addTaskToCourse, addSubmissionToCourseTask, getAllCourses, getCourse} = require('../courseTestQueries')
const { query } = require('express')
const mongoose = require('mongoose')
const helpers = require('../testHelpers')
const config = require('../../config')






describe('course creation tests', () => {
    test('createCourse query returns correctly with correct parameters', async () => { 
        const user = await helpers.logIn("username", "12345")
        const createdCourse = await helpers.makeQuery({query: createCourse, variables: {uniqueName: "unique-name", name: "common name", teacher: "username"}})
        const correctReturnValue = {
            uniqueName: 'unique-name',
            name: 'common name',
            teacher: {
                username: 'username',
                name: 'name'
            },
            students: [],
            tasks: {
                textTasks: []
            },
            infoPages: []
        }
        console.log(createdCourse)
        expect(createdCourse.data.createCourse).toEqual(correctReturnValue)
    })

    test('createCourse query saves course to database correctly with correct parameters', async () => {
        const user = await helpers.logIn("username", "12345")
        const createdCourse = await helpers.makeQuery({query: createCourse, variables: {uniqueName: "uniqueName", name: "common name", teacher: "username"}})
        
        const correctReturnValue = {
            uniqueName: 'uniqueName',
            name: 'common name',
            teacher: {
                username: 'username',
                name: 'name'
            },
            tasks: {
                textTasks: [],
                multipleChoiceTasks: [],
            },
            students: [],
            infoPages: []
        }

        //database was cleared before this test, so the database should only have 1 course created
        const savedCourses = await Course.find({}).populate('teacher')
        expect(savedCourses.length).toBe(1)
        
        const savedCourse = savedCourses[0].toObject()
        
        expect(savedCourse.name).toEqual(correctReturnValue.name)
        expect(savedCourse.teacher.username).toEqual(correctReturnValue.teacher.username)
        expect(savedCourse.teacher.name).toEqual(correctReturnValue.teacher.name)
        expect(savedCourse.students).toEqual(correctReturnValue.students)
        expect(savedCourse.infoPages).toEqual(correctReturnValue.infoPages)
        
        delete savedCourse.tasks._id
        expect(savedCourse.tasks).toEqual(correctReturnValue.tasks)
    })
    test('createCourse query saves course reference to user correctly', async () => {
        const user = await helpers.logIn("username", "12345")
        const createdCourse = await helpers.makeQuery({query: createCourse, variables: {uniqueName: "uniqueName", name: "common name", teacher: "username"}})
        
        const correctReturnValue = {
            uniqueName: 'uniqueName',
            name: 'common name',
            teacher: {
                username: 'username',
                name: 'name'
            },
            students: [],
            infoPages: []
        }

      
        const savedCourses = await Course.find({}).populate('teacher')
        expect(savedCourses.length).toBe(1)
        const savedCourse = savedCourses[0]


        const savedUsers = await User.find({username: "username"}).populate(['teachesCourses', 'attendsCourses'])
        expect(savedUsers.length).toBe(1)
        const userInDB = savedUsers[0] 
        expect(userInDB.attendsCourses.length).toBe(0)
        expect(userInDB.teachesCourses.length).toBe(1)
        expect(userInDB.teachesCourses[0].id).toEqual(savedCourse.id)
        
    })
    test('createCourse query returns error if authentication is not done and doesnt save anything to database', async () => {
        const createdCourse = await helpers.makeQuery({query: createCourse, variables: {uniqueName: "uniqueName", name: "common name", teacher: "does not exist"}})
        expect(createdCourse.data.createCourse).toEqual(null)
        expect(createdCourse.errors[0].message).toEqual('Unauthorized')

        const savedCourses = await Course.find({}).populate('teacher')
        expect(savedCourses.length).toBe(0)
        
    })
    describe('createCourse course unique name tests', () => {
        test('createCourse query returns error if unique name contains spaces', async () => {
            await helpers.logIn("username", "12345")
            const createdCourse = await helpers.makeQuery({query: createCourse, variables: {uniqueName: "unique name", name: "common name", teacher: "does not exist"}})
            expect(createdCourse.data.createCourse).toEqual(null)
            expect(createdCourse.errors[0].message).toEqual('Incorrect unique name')
    
            const savedCourses = await Course.find({}).populate('teacher')
            expect(savedCourses.length).toBe(0)
            
        })
        test('createCourse query returns error if unique name contains /', async () => {
            await helpers.logIn("username", "12345")
            const createdCourse = await helpers.makeQuery({query: createCourse, variables: {uniqueName: "unique/name", name: "common name", teacher: "does not exist"}})
            expect(createdCourse.data.createCourse).toEqual(null)
            expect(createdCourse.errors[0].message).toEqual('Incorrect unique name')
    
            const savedCourses = await Course.find({}).populate('teacher')
            expect(savedCourses.length).toBe(0)
            
        })
    })
    
})