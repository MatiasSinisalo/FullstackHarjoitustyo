const {server, apolloServer} = require('../server')
const request = require('supertest')
const Course = require('../models/course')
const User = require('../models/user')
const { userCreateQuery, userLogInQuery, createSpesificUserQuery } = require('./userTestQueries')
const { createCourse, addStudentToCourse, removeStudentFromCourse } = require('./courseTestQueries')
const { query } = require('express')

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
})

describe('course tests', () => {
    describe('course creation tests', () => {
        test('createCourse query returns correctly with correct parameters', async () => {
            apolloServer.context = {userForToken: {username: "username", name: "name"}}

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

        test('createCourse query saves course to database correctly with correct parameters', async () => {
            apolloServer.context = {userForToken: {username: "username", name: "name"}}
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

            //database was cleared before this test, so the database should only have 1 course created
            const savedCourses = await Course.find({}).populate('teacher')
            expect(savedCourses.length).toBe(1)
            
            const savedCourse = savedCourses[0]
            expect(savedCourse.uniqueName).toEqual(correctReturnValue.uniqueName)
            expect(savedCourse.name).toEqual(correctReturnValue.name)
            expect(savedCourse.teacher.username).toEqual(correctReturnValue.teacher.username)
            expect(savedCourse.teacher.name).toEqual(correctReturnValue.teacher.name)
            expect(savedCourse.students).toEqual(correctReturnValue.students)

        })

        test('createCourse query returns error if teacher user does not exist', async () => {
            apolloServer.context = {userForToken: {username: "does not exist", name: "name"}}
            const createdCourse = await apolloServer.executeOperation({query: createCourse, variables: {uniqueName: "uniqueName", name: "common name", teacher: "does not exist"}})
            expect(createdCourse.data.createCourse).toEqual(null)
            expect(createdCourse.errors[0].message).toEqual('no user with given username found!')
            
        })

        test('createCourse query returns error if authentication is not done and doesnt save anything to database', async () => {
            const createdCourse = await apolloServer.executeOperation({query: createCourse, variables: {uniqueName: "uniqueName", name: "common name", teacher: "does not exist"}})
            expect(createdCourse.data.createCourse).toEqual(null)
            expect(createdCourse.errors[0].message).toEqual('Unauthorized')

            const savedCourses = await Course.find({}).populate('teacher')
            expect(savedCourses.length).toBe(0)
            
        })
    })



    describe('Course add student tests', () => {
        test('addStudentToCourse query made by the teacher of the course allows any user to be added', async () => {
            apolloServer.context = {userForToken: {username: "username", name: "name"}}
            
            const createdCourse = await apolloServer.executeOperation({query: createCourse, variables: {uniqueName: "course owned by username", name: "common name", teacher: "username"}})
            const courseWithAddedStudent = await apolloServer.executeOperation({query: addStudentToCourse, variables: {addStudentToCourseUsername: "students username", courseUniqueName: "course owned by username"}})
            
            expect(courseWithAddedStudent.data.addStudentToCourse).toEqual({
                uniqueName: "course owned by username", 
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
            expect(course.uniqueName).toBe("course owned by username")
            expect(course.name).toBe("common name")
            expect(course.students.length).toBe(1)
            expect(course.students[0].username).toBe("students username")
            expect(course.students[0].name).toBe("students name")
            expect(course.teacher.username).toBe("username")
            expect(course.teacher.name).toBe("name")


            

        })

        test('addStudentToCourse query returns error given username not found if trying to add a student that does not exist, and does not modifyi database', async () => {
            apolloServer.context = {userForToken: {username: "username", name: "name"}}
            
            const createdCourse = await apolloServer.executeOperation({query: createCourse, variables: {uniqueName: "course owned by username", name: "common name", teacher: "username"}})
            const courseWithAddedStudent = await apolloServer.executeOperation({query: addStudentToCourse, variables: {addStudentToCourseUsername: "this user does not exist", courseUniqueName: "course owned by username"}})
            
            expect(courseWithAddedStudent.errors[0].message).toEqual("Given username not found")
            expect(courseWithAddedStudent.data.addStudentToCourse).toEqual(null)

            const allCourses = await Course.find({}).populate("teacher")
            
            //all courses length should be 1 since we reset the test database after each test
            expect(allCourses.length).toBe(1)
            
            const course = allCourses[0]
            expect(course.uniqueName).toBe("course owned by username")
            expect(course.name).toBe("common name")
            expect(course.students.length).toBe(0)
            expect(course.teacher.username).toBe("username")
            expect(course.teacher.name).toBe("name")
        })

        test('addStudentToCourse query returns error given username not found if trying to add a student to a course that does not exist and does not modifyi database', async () => {
            apolloServer.context = {userForToken: {username: "username", name: "name"}}
            
            const courseWithAddedStudent = await apolloServer.executeOperation({query: addStudentToCourse, variables: {addStudentToCourseUsername: "students username", courseUniqueName: "this course does not exist"}})
            
            expect(courseWithAddedStudent.errors[0].message).toEqual("Given course not found")
            expect(courseWithAddedStudent.data.addStudentToCourse).toEqual(null)

            const allCourses = await Course.find({}).populate("teacher")
            expect(allCourses.length).toBe(0)
            
        })

        test('addStudentToCourse query returns error if trying to add a student to a course that already exists in the course', async () => {
            apolloServer.context = {userForToken: {username: "username", name: "name"}}
            
            const createdCourse = await apolloServer.executeOperation({query: createCourse, variables: {uniqueName: "course owned by username", name: "common name", teacher: "username"}})
            
            const courseWithAddedStudent = await apolloServer.executeOperation({query: addStudentToCourse, variables: {addStudentToCourseUsername: "students username", courseUniqueName: "course owned by username"}})
            const courseWithDoublicateAddedStudent = await apolloServer.executeOperation({query: addStudentToCourse, variables: {addStudentToCourseUsername: "students username", courseUniqueName: "course owned by username"}})
            
            expect(courseWithDoublicateAddedStudent.errors[0].message).toEqual("Given user is already in the course")
            expect(courseWithDoublicateAddedStudent.data.addStudentToCourse).toEqual(null)
           
            const allCourses = await Course.find({}).populate(['teacher', 'students'])
            expect(allCourses.length).toBe(1)
            const course = allCourses[0]
            expect(course.uniqueName).toBe("course owned by username")
            expect(course.name).toBe("common name")
            expect(course.students.length).toBe(1)
            expect(course.students[0].username).toBe("students username")
            expect(course.students[0].name).toBe("students name")
            expect(course.teacher.username).toBe("username")
            expect(course.teacher.name).toBe("name")
        })



        test('addStudentToCourse allows an user to add themselves to the course', async () => {
            //create course as username
            apolloServer.context = {userForToken: {username: "username", name: "name"}}
            const createdCourse = await apolloServer.executeOperation({query: createCourse, variables: {uniqueName: "course owned by username", name: "common name", teacher: "username"}})
            
            //add student to course as a course student
            apolloServer.context = {userForToken: {username: "students username", name: "students name"}}
            const courseWithAddedStudent = await apolloServer.executeOperation({query: addStudentToCourse, variables: {addStudentToCourseUsername: "students username", courseUniqueName: "course owned by username"}})
            
            expect(courseWithAddedStudent.data.addStudentToCourse).toEqual({
                uniqueName: "course owned by username", 
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
            expect(course.uniqueName).toBe("course owned by username")
            expect(course.name).toBe("common name")
            expect(course.students.length).toBe(1)
            expect(course.students[0].username).toBe("students username")
            expect(course.students[0].name).toBe("students name")
            expect(course.teacher.username).toBe("username")
            expect(course.teacher.name).toBe("name")
        })


        test('addStudentToCourse doesnt allow user that is not a teacher to add other users as students but return Unauthorized and doesnt modfyi database', async () => {
            //create course as username
            apolloServer.context = {userForToken: {username: "username", name: "name"}}
            const createdCourse = await apolloServer.executeOperation({query: createCourse, variables: {uniqueName: "course owned by username", name: "common name", teacher: "username"}})
            
            //add other student to course as a course student
            apolloServer.context = {userForToken: {username: "students username", name: "students name"}}
            const courseWithAddedStudent = await apolloServer.executeOperation({query: addStudentToCourse, variables: {addStudentToCourseUsername: "username", courseUniqueName: "course owned by username"}})
            
            expect(courseWithAddedStudent.errors[0].message).toEqual("Unauthorized")
            expect(courseWithAddedStudent.data.addStudentToCourse).toEqual(null)

            const allCourses = await Course.find({}).populate("teacher")
            expect(allCourses.length).toBe(1)

            const course = allCourses[0]
            expect(course.uniqueName).toBe("course owned by username")
            expect(course.name).toBe("common name")
            expect(course.students.length).toBe(0)
            expect(course.teacher.username).toBe("username")
            expect(course.teacher.name).toBe("name")
        })
    })


    describe('removeStudentFromCourse query tests', () => {
        test('removeStudentFromCourse query allows teacher to remove any student from course', async () => {
            apolloServer.context = {userForToken: {username: "username", name: "name"}}
            const createdCourse = await apolloServer.executeOperation({query: createCourse, variables: {uniqueName: "course owned by username", name: "common name", teacher: "username"}})
            const courseWithAddedStudent = await apolloServer.executeOperation({query: addStudentToCourse, variables: {addStudentToCourseUsername: "students username", courseUniqueName: "course owned by username"}})
           
            const courseAfterRemoval = await apolloServer.executeOperation({query: removeStudentFromCourse, variables: {username: "students username", courseUniqueName: "course owned by username"}})
            expect(courseAfterRemoval.data.removeStudentFromCourse).toEqual(
                {
                    uniqueName: "course owned by username", 
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
            expect(course.uniqueName).toBe("course owned by username")
            expect(course.name).toBe("common name")
            expect(course.students.length).toBe(0)
            expect(course.teacher.username).toBe("username")
            expect(course.teacher.name).toBe("name")
        })

        test('removeStudentFromCourse query allows student to remove themselves from the course', async () => {
            apolloServer.context = {userForToken: {username: "username", name: "name"}}
            const createdCourse = await apolloServer.executeOperation({query: createCourse, variables: {uniqueName: "course owned by username", name: "common name", teacher: "username"}})
            const courseWithAddedStudent = await apolloServer.executeOperation({query: addStudentToCourse, variables: {addStudentToCourseUsername: "students username", courseUniqueName: "course owned by username"}})
           
            apolloServer.context = {userForToken: {username: "students username", name: "students name"}}
            const courseAfterRemoval = await apolloServer.executeOperation({query: removeStudentFromCourse, variables: {username: "students username", courseUniqueName: "course owned by username"}})
            expect(courseAfterRemoval.data.removeStudentFromCourse).toEqual(
                {
                    uniqueName: "course owned by username", 
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
            expect(course.uniqueName).toBe("course owned by username")
            expect(course.name).toBe("common name")
            expect(course.students.length).toBe(0)
            expect(course.teacher.username).toBe("username")
            expect(course.teacher.name).toBe("name")
        })

        test('removeStudentFromCourse query returns Unauthorized and doesnt modifyi database if student tries to remove some other student from the course', async () => {
            apolloServer.context = {userForToken: {username: "username", name: "name"}}
            const createdCourse = await apolloServer.executeOperation({query: createCourse, variables: {uniqueName: "course owned by username", name: "common name", teacher: "username"}})
            const courseWithAddedStudent = await apolloServer.executeOperation({query: addStudentToCourse, variables: {addStudentToCourseUsername: "username", courseUniqueName: "course owned by username"}})
           
            apolloServer.context = {userForToken: {username: "students username", name: "students name"}}
            const courseAfterRemoval = await apolloServer.executeOperation({query: removeStudentFromCourse, variables: {username: "username", courseUniqueName: "course owned by username"}})
            expect(courseAfterRemoval.errors[0].message).toEqual("Unauthorized")
            expect(courseAfterRemoval.data.removeStudentFromCourse).toEqual(null)

            const allCourses = await Course.find({}).populate("teacher")
            expect(allCourses.length).toBe(1)

            const course = allCourses[0]
            expect(course.uniqueName).toBe("course owned by username")
            expect(course.name).toBe("common name")
            expect(course.students.length).toBe(1)
            expect(course.teacher.username).toBe("username")
            expect(course.teacher.name).toBe("name")
        })

        test('removeStudentFromCourse returns user not found if trying to remove student that does not exist', async () => {
            apolloServer.context = {userForToken: {username: "username", name: "name"}}
            const createdCourse = await apolloServer.executeOperation({query: createCourse, variables: {uniqueName: "course owned by username", name: "common name", teacher: "username"}})
            const courseWithAddedStudent = await apolloServer.executeOperation({query: addStudentToCourse, variables: {addStudentToCourseUsername: "username", courseUniqueName: "course owned by username"}})
           
            const courseAfterRemoval = await apolloServer.executeOperation({query: removeStudentFromCourse, variables: {username: "students username", courseUniqueName: "course owned by username"}})
            expect(courseAfterRemoval.errors[0].message).toEqual("Given user is not in the course")
            expect(courseAfterRemoval.data.removeStudentFromCourse).toEqual(null)
    
            const allCourses = await Course.find({}).populate("teacher")
            expect(allCourses.length).toBe(1)
    
            const course = allCourses[0]
            expect(course.uniqueName).toBe("course owned by username")
            expect(course.name).toBe("common name")
            expect(course.students.length).toBe(1)
            expect(course.teacher.username).toBe("username")
            expect(course.teacher.name).toBe("name")
        })

        test('removeStudentFromCourse returns user not found if trying to remove user that does not exist at all', async () => {
            apolloServer.context = {userForToken: {username: "username", name: "name"}}
            const createdCourse = await apolloServer.executeOperation({query: createCourse, variables: {uniqueName: "course owned by username", name: "common name", teacher: "username"}})
            const courseWithAddedStudent = await apolloServer.executeOperation({query: addStudentToCourse, variables: {addStudentToCourseUsername: "username", courseUniqueName: "course owned by username"}})
           
            const courseAfterRemoval = await apolloServer.executeOperation({query: removeStudentFromCourse, variables: {username: "this user does not exist", courseUniqueName: "course owned by username"}})
            expect(courseAfterRemoval.errors[0].message).toEqual("Given username not found")
            expect(courseAfterRemoval.data.removeStudentFromCourse).toEqual(null)
    
            const allCourses = await Course.find({}).populate("teacher")
            expect(allCourses.length).toBe(1)
    
            const course = allCourses[0]
            expect(course.uniqueName).toBe("course owned by username")
            expect(course.name).toBe("common name")
            expect(course.students.length).toBe(1)
            expect(course.teacher.username).toBe("username")
            expect(course.teacher.name).toBe("name")
        })
    })
})