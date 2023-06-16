const {server, apolloServer} = require('../../server')
const request = require('supertest')
const Course = require('../../models/course')
const User = require('../../models/user')
const {Task} = require('../../models/task')
const { userCreateQuery, userLogInQuery, createSpesificUserQuery } = require('../userTestQueries')
const { createCourse, addStudentToCourse, addTaskToCourse, addSubmissionToCourseTask, getAllCourses, getCourse} = require('../courseTestQueries')
const { query } = require('express')
const mongoose = require('mongoose')
const course = require('../../models/course')
const helpers = require('../testHelpers')
const config = require('../../config')
beforeAll(async () => {
    await mongoose.connect(config.MONGODB_URI)
    await Course.deleteMany({})
    await User.deleteMany({})
    await request(config.LOCAL_SERVER_URL).post("/").send({query: userCreateQuery, variables: {}})
    await request(config.LOCAL_SERVER_URL).post("/").send({query: createSpesificUserQuery, variables:{username: "students username", name: "students name", password: "12345"}})
})

afterAll(async () => {
    
    await Course.deleteMany({})
    await User.deleteMany({})
    await mongoose.connection.close()
})

beforeEach(async () => {
    await Course.deleteMany({})
    await Task.deleteMany({})
    helpers.logOut()
})



describe('Course add student tests', () => {
    test('addStudentToCourse query made by the teacher of the course allows any user to be added', async () => {
        await helpers.logIn("username", apolloServer)
        
        const createdCourse = await helpers.makeQuery({query: createCourse, variables: {uniqueName: "course-owned-by-username", name: "common name", teacher: "username"}})
        const courseWithAddedStudent = await helpers.makeQuery({query: addStudentToCourse, variables: {addStudentToCourseUsername: "students username", courseUniqueName: "course-owned-by-username"}})
        
        expect(courseWithAddedStudent.data.addStudentToCourse).toEqual({
            uniqueName: "course-owned-by-username", 
            name: "common name", 
            teacher: {
                username: "username",
                name: "name"
            },
            students: [{username: "students username", name: "students name"}]
        })

        const allCourses = await Course.find({}).populate(['teacher', 'students'])
        expect(allCourses.length).toBe(1)

        const course = allCourses[0]
        expect(course.uniqueName).toBe("course-owned-by-username")
        expect(course.name).toBe("common name")
        expect(course.students.length).toBe(1)
        expect(course.students[0].username).toBe("students username")
        expect(course.students[0].name).toBe("students name")
        expect(course.teacher.username).toBe("username")
        expect(course.teacher.name).toBe("name")


        

    })

    test('addStudentToCourse query returns error given username not found if trying to add a student that does not exist, and does not modifyi database', async () => {
        await helpers.logIn("username", apolloServer)
        
        const createdCourse = await helpers.makeQuery({query: createCourse, variables: {uniqueName: "course-owned-by-username", name: "common name", teacher: "username"}})
        const courseWithAddedStudent = await helpers.makeQuery({query: addStudentToCourse, variables: {addStudentToCourseUsername: "this user does not exist", courseUniqueName: "course-owned-by-username"}})
        
        expect(courseWithAddedStudent.errors[0].message).toEqual("Given username not found")
        expect(courseWithAddedStudent.data.addStudentToCourse).toEqual(null)

        const allCourses = await Course.find({}).populate("teacher")
        
        //all courses length should be 1 since we reset the test database after each test
        expect(allCourses.length).toBe(1)
        
        const course = allCourses[0]
        expect(course.uniqueName).toBe("course-owned-by-username")
        expect(course.name).toBe("common name")
        expect(course.students.length).toBe(0)
        expect(course.teacher.username).toBe("username")
        expect(course.teacher.name).toBe("name")
    })

    test('addStudentToCourse query returns error given username not found if trying to add a student to a course that does not exist and does not modifyi database', async () => {
        await helpers.logIn("username", apolloServer)
        
        const courseWithAddedStudent = await helpers.makeQuery({query: addStudentToCourse, variables: {addStudentToCourseUsername: "students username", courseUniqueName: "this course does not exist"}})
        
        expect(courseWithAddedStudent.errors[0].message).toEqual("Given course not found")
        expect(courseWithAddedStudent.data.addStudentToCourse).toEqual(null)

        const allCourses = await Course.find({}).populate("teacher")
        expect(allCourses.length).toBe(0)
        
    })

    test('addStudentToCourse query returns error if trying to add a student to a course that already exists in the course', async () => {
        await helpers.logIn("username", apolloServer)
        
        const createdCourse = await helpers.makeQuery({query: createCourse, variables: {uniqueName: "course-owned-by-username", name: "common name", teacher: "username"}})
        
        const courseWithAddedStudent = await helpers.makeQuery({query: addStudentToCourse, variables: {addStudentToCourseUsername: "students username", courseUniqueName: "course-owned-by-username"}})
        const courseWithDoublicateAddedStudent = await helpers.makeQuery({query: addStudentToCourse, variables: {addStudentToCourseUsername: "students username", courseUniqueName: "course-owned-by-username"}})
        
        expect(courseWithDoublicateAddedStudent.errors[0].message).toEqual("Given user is already in the course")
        expect(courseWithDoublicateAddedStudent.data.addStudentToCourse).toEqual(null)
       
        const allCourses = await Course.find({}).populate(['teacher', 'students'])
        expect(allCourses.length).toBe(1)
        const course = allCourses[0]
        expect(course.uniqueName).toBe("course-owned-by-username")
        expect(course.name).toBe("common name")
        expect(course.students.length).toBe(1)
        expect(course.students[0].username).toBe("students username")
        expect(course.students[0].name).toBe("students name")
        expect(course.teacher.username).toBe("username")
        expect(course.teacher.name).toBe("name")
    })



    test('addStudentToCourse allows an user to add themselves to the course', async () => {
        //create course as username
        await helpers.logIn("username", apolloServer)
        const createdCourse = await helpers.makeQuery({query: createCourse, variables: {uniqueName: "course-owned-by-username", name: "common name", teacher: "username"}})
        
        //add student to course as a course student
        await helpers.logIn("students username", apolloServer)
        const courseWithAddedStudent = await helpers.makeQuery({query: addStudentToCourse, variables: {addStudentToCourseUsername: "students username", courseUniqueName: "course-owned-by-username"}})
        
        expect(courseWithAddedStudent.data.addStudentToCourse).toEqual({
            uniqueName: "course-owned-by-username", 
            name: "common name", 
            teacher: {
                username: "username",
                name: "name"
            },
            students: [{username: "students username", name: "students name"}]
        })

        const allCourses = await Course.find({}).populate(['teacher', 'students'])
        expect(allCourses.length).toBe(1)

        const course = allCourses[0]
        expect(course.uniqueName).toBe("course-owned-by-username")
        expect(course.name).toBe("common name")
        expect(course.students.length).toBe(1)
        expect(course.students[0].username).toBe("students username")
        expect(course.students[0].name).toBe("students name")
        expect(course.teacher.username).toBe("username")
        expect(course.teacher.name).toBe("name")
    })


    test('addStudentToCourse doesnt allow user that is not a teacher to add other users as students but return Unauthorized and doesnt modify database', async () => {
        //create course as username
        await helpers.logIn("username", apolloServer)
        const createdCourse = await helpers.makeQuery({query: createCourse, variables: {uniqueName: "course-owned-by-username", name: "common name", teacher: "username"}})
        
        //add other student to course as a course student
        await helpers.logIn("students username", apolloServer)
        const courseWithAddedStudent = await helpers.makeQuery({query: addStudentToCourse, variables: {addStudentToCourseUsername: "username", courseUniqueName: "course-owned-by-username"}})
        
        expect(courseWithAddedStudent.errors[0].message).toEqual("Unauthorized")
        expect(courseWithAddedStudent.data.addStudentToCourse).toEqual(null)

        const allCourses = await Course.find({}).populate("teacher")
        expect(allCourses.length).toBe(1)

        const course = allCourses[0]
        expect(course.uniqueName).toBe("course-owned-by-username")
        expect(course.name).toBe("common name")
        expect(course.students.length).toBe(0)
        expect(course.teacher.username).toBe("username")
        expect(course.teacher.name).toBe("name")
    })
})