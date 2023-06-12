const {server, apolloServer} = require('../../server')
const request = require('supertest')
const Course = require('../../models/course')
const User = require('../../models/user')
const {Task} = require('../../models/task')
const { userCreateQuery, userLogInQuery, createSpesificUserQuery } = require('../userTestQueries')
const { createCourse, addStudentToCourse, removeStudentFromCourse, addTaskToCourse, addSubmissionToCourseTask, getAllCourses, getCourse} = require('../courseTestQueries')
const { query } = require('express')
const mongoose = require('mongoose')
const course = require('../../models/course')
const helpers = require('../testHelpers')

beforeAll(async () => {
    await server.start("test server ready")
    await Course.deleteMany({})
    await User.deleteMany({})
    await apolloServer.executeOperation({query: userCreateQuery, variables:{}})
    await apolloServer.executeOperation({query: createSpesificUserQuery, variables:{username: "students username", name: "students name", password: "1234"}})
})

afterAll(async () => {
    await Course.deleteMany({})
    await User.deleteMany({})
    await server.stop()
})

beforeEach(async () => {
    apolloServer.context = {}
    await Course.deleteMany({})
    await Task.deleteMany({})
})



describe('removeStudentFromCourse query tests', () => {
    test('removeStudentFromCourse query allows teacher to remove any student from course', async () => {
        await helpers.logIn("username", apolloServer)
        const createdCourse = await apolloServer.executeOperation({query: createCourse, variables: {uniqueName: "course-owned-by-username", name: "common name", teacher: "username"}})
        const courseWithAddedStudent = await apolloServer.executeOperation({query: addStudentToCourse, variables: {addStudentToCourseUsername: "students username", courseUniqueName: "course-owned-by-username"}})
       
        const courseAfterRemoval = await apolloServer.executeOperation({query: removeStudentFromCourse, variables: {username: "students username", courseUniqueName: "course-owned-by-username"}})
        expect(courseAfterRemoval.data.removeStudentFromCourse).toEqual(
            {
                uniqueName: "course-owned-by-username", 
                name: "common name", 
                teacher: {
                    username: "username",
                    name: "name"
                },
                students: []
            }
        )

        const allCourses = await Course.find({}).populate("teacher")
        expect(allCourses.length).toBe(1)

        const course = allCourses[0]
        expect(course.uniqueName).toBe("course-owned-by-username")
        expect(course.name).toBe("common name")
        expect(course.students.length).toBe(0)
        expect(course.teacher.username).toBe("username")
        expect(course.teacher.name).toBe("name")
    })

    test('removeStudentFromCourse query allows student to remove themselves from the course', async () => {
        await helpers.logIn("username", apolloServer)
        const createdCourse = await apolloServer.executeOperation({query: createCourse, variables: {uniqueName: "course-owned-by-username", name: "common name", teacher: "username"}})
        const courseWithAddedStudent = await apolloServer.executeOperation({query: addStudentToCourse, variables: {addStudentToCourseUsername: "students username", courseUniqueName: "course-owned-by-username"}})
       
        await helpers.logIn("students username", apolloServer)
        const courseAfterRemoval = await apolloServer.executeOperation({query: removeStudentFromCourse, variables: {username: "students username", courseUniqueName: "course-owned-by-username"}})
        expect(courseAfterRemoval.data.removeStudentFromCourse).toEqual(
            {
                uniqueName: "course-owned-by-username", 
                name: "common name", 
                teacher: {
                    username: "username",
                    name: "name"
                },
                students: []
            }
        )

        const allCourses = await Course.find({}).populate("teacher")
        expect(allCourses.length).toBe(1)

        const course = allCourses[0]
        expect(course.uniqueName).toBe("course-owned-by-username")
        expect(course.name).toBe("common name")
        expect(course.students.length).toBe(0)
        expect(course.teacher.username).toBe("username")
        expect(course.teacher.name).toBe("name")
    })

    test('removeStudentFromCourse query returns Unauthorized and doesnt modifyi database if student tries to remove some other student from the course', async () => {
        await helpers.logIn("username", apolloServer)
        const createdCourse = await apolloServer.executeOperation({query: createCourse, variables: {uniqueName: "course-owned-by-username", name: "common name", teacher: "username"}})
        const courseWithAddedStudent = await apolloServer.executeOperation({query: addStudentToCourse, variables: {addStudentToCourseUsername: "username", courseUniqueName: "course-owned-by-username"}})
       
        await helpers.logIn("students username", apolloServer)
        const courseAfterRemoval = await apolloServer.executeOperation({query: removeStudentFromCourse, variables: {username: "username", courseUniqueName: "course-owned-by-username"}})
        expect(courseAfterRemoval.errors[0].message).toEqual("Unauthorized")
        expect(courseAfterRemoval.data.removeStudentFromCourse).toEqual(null)

        const allCourses = await Course.find({}).populate("teacher")
        expect(allCourses.length).toBe(1)

        const course = allCourses[0]
        expect(course.uniqueName).toBe("course-owned-by-username")
        expect(course.name).toBe("common name")
        expect(course.students.length).toBe(1)
        expect(course.teacher.username).toBe("username")
        expect(course.teacher.name).toBe("name")
    })

    test('removeStudentFromCourse returns user not found if trying to remove student that does not exist', async () => {
        await helpers.logIn("username", apolloServer)
        const createdCourse = await apolloServer.executeOperation({query: createCourse, variables: {uniqueName: "course-owned-by-username", name: "common name", teacher: "username"}})
        const courseWithAddedStudent = await apolloServer.executeOperation({query: addStudentToCourse, variables: {addStudentToCourseUsername: "username", courseUniqueName: "course-owned-by-username"}})
       
        const courseAfterRemoval = await apolloServer.executeOperation({query: removeStudentFromCourse, variables: {username: "students username", courseUniqueName: "course-owned-by-username"}})
        expect(courseAfterRemoval.errors[0].message).toEqual("Given user is not in the course")
        expect(courseAfterRemoval.data.removeStudentFromCourse).toEqual(null)

        const allCourses = await Course.find({}).populate("teacher")
        expect(allCourses.length).toBe(1)

        const course = allCourses[0]
        expect(course.uniqueName).toBe("course-owned-by-username")
        expect(course.name).toBe("common name")
        expect(course.students.length).toBe(1)
        expect(course.teacher.username).toBe("username")
        expect(course.teacher.name).toBe("name")
    })

    test('removeStudentFromCourse returns user not found if trying to remove user that does not exist at all', async () => {
        await helpers.logIn("username", apolloServer)
        const createdCourse = await apolloServer.executeOperation({query: createCourse, variables: {uniqueName: "course-owned-by-username", name: "common name", teacher: "username"}})
        const courseWithAddedStudent = await apolloServer.executeOperation({query: addStudentToCourse, variables: {addStudentToCourseUsername: "username", courseUniqueName: "course-owned-by-username"}})
       
        const courseAfterRemoval = await apolloServer.executeOperation({query: removeStudentFromCourse, variables: {username: "this user does not exist", courseUniqueName: "course-owned-by-username"}})
        expect(courseAfterRemoval.errors[0].message).toEqual("Given username not found")
        expect(courseAfterRemoval.data.removeStudentFromCourse).toEqual(null)

        const allCourses = await Course.find({}).populate("teacher")
        expect(allCourses.length).toBe(1)

        const course = allCourses[0]
        expect(course.uniqueName).toBe("course-owned-by-username")
        expect(course.name).toBe("common name")
        expect(course.students.length).toBe(1)
        expect(course.teacher.username).toBe("username")
        expect(course.teacher.name).toBe("name")
    })


    test('removeStudentFromCourse returns course not found if trying to remove a user from a course that does not exist', async () => {
        await helpers.logIn("username", apolloServer)
        const createdCourse = await apolloServer.executeOperation({query: createCourse, variables: {uniqueName: "course-owned-by-username", name: "common name", teacher: "username"}})
        const courseWithAddedStudent = await apolloServer.executeOperation({query: addStudentToCourse, variables: {addStudentToCourseUsername: "username", courseUniqueName: "course-owned-by-username"}})
       
        const courseAfterRemoval = await apolloServer.executeOperation({query: removeStudentFromCourse, variables: {username: "username", courseUniqueName: "course that does not exist"}})
        expect(courseAfterRemoval.errors[0].message).toEqual("Given course not found")
        expect(courseAfterRemoval.data.removeStudentFromCourse).toEqual(null)

        const allCourses = await Course.find({}).populate("teacher")
        expect(allCourses.length).toBe(1)

        const course = allCourses[0]
        expect(course.uniqueName).toBe("course-owned-by-username")
        expect(course.name).toBe("common name")
        expect(course.students.length).toBe(1)
        expect(course.teacher.username).toBe("username")
        expect(course.teacher.name).toBe("name")
    })
})