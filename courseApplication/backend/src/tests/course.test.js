const {server, apolloServer} = require('../server')
const request = require('supertest')
const Course = require('../models/course')
const User = require('../models/user')
const {Task} = require('../models/task')
const { userCreateQuery, userLogInQuery, createSpesificUserQuery } = require('./userTestQueries')
const { createCourse, addStudentToCourse, removeStudentFromCourse, addTaskToCourse, addSubmissionToCourseTask, getAllCourses, removeCourse, getCourse, removeTaskFromCourse, removeSubmissionFromCourseTask, modifySubmission } = require('./courseTestQueries')
const { query } = require('express')
const mongoose = require('mongoose')
const course = require('../models/course')
const helpers = require('./testHelpers')

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

describe('course tests', () => {
    describe('course querying tests', () => {
        describe('getAllCourses query tests', () => {
            test('getAllCourses returns course public data correctly', async () => {
                const user = await User.findOne({username: "username"})
                apolloServer.context = {userForToken: {username: "username", name: "name", id: user._id.toString()}}
                const courseData = {
                    uniqueName: "uniqueName", 
                    name: "common name", 
                    teacher: "username"
                }

                const createdCourse = await apolloServer.executeOperation({query: createCourse, variables: {...courseData}})
                const courseInDB = createdCourse.data.createCourse
                const coursesQuery = await apolloServer.executeOperation({query: getAllCourses})
                const courses = coursesQuery.data.allCourses

                expect(courses[0].uniqueName).toEqual(courseData.uniqueName)
                expect(courses[0].name).toEqual(courseData.name)
                expect(courses[0].teacher).toEqual({username: courseInDB.teacher.username, name:courseInDB.teacher.name, id: user._id.toString()})

            })
            test('getAllCourses returns Unauthorized if user is not logged in', async () => {
                const courseData = {
                    uniqueName: "uniqueName", 
                    name: "common name", 
                    teacher: "username"
                }
                const createdCourse = await apolloServer.executeOperation({query: createCourse, variables: {...courseData}})
                const courseInDB = createdCourse.data.createCourse
                
                const coursesQuery = await apolloServer.executeOperation({query: getAllCourses})
                expect(coursesQuery.data).toEqual(null)
                expect(coursesQuery.errors[0].message).toEqual("Unauthorized")
            })

            test('getAllCourses returns student info only from courses where the user is a student', async () => {
                const user = await User.findOne({username: "username"})
                apolloServer.context = {userForToken: {username: "username", name: "name", id: user._id.toString()}}
                const courseData = {
                    uniqueName: "courses name where the user is a student", 
                    name: "common name", 
                    teacher: "username"
                }
                const secondCourseData = {
                    uniqueName: "courses name where the user is not a student", 
                    name: "common name", 
                    teacher: "username"
                }
                await apolloServer.executeOperation({query: createCourse, variables: {...courseData}})
                await apolloServer.executeOperation({query: createCourse, variables: {...secondCourseData}})

                //lets add the teacher as a student to both of the courses, the second student should't get this info when asking for allCourses
                await apolloServer.executeOperation({query: addStudentToCourse, variables: {courseUniqueName: "courses name where the user is a student", addStudentToCourseUsername: "username"}})
                await apolloServer.executeOperation({query: addStudentToCourse, variables: {courseUniqueName: "courses name where the user is not a student", addStudentToCourseUsername: "username"}})

                const studentUser = await User.findOne({username: "students username"})
                apolloServer.context = {userForToken: {username: studentUser.username, name: studentUser.name, id: studentUser._id.toString()}}
                await apolloServer.executeOperation({query: addStudentToCourse, variables: {courseUniqueName: "courses name where the user is a student", addStudentToCourseUsername: studentUser.username}})

                const coursesQuery = await apolloServer.executeOperation({query: getAllCourses})
                const courses = coursesQuery.data.allCourses
                
                //first lets check firstCourse, there should only be the info of our student
                const returnedCourseDataWithStudent = courses.find((course) => course.uniqueName ===  "courses name where the user is a student")
                expect(returnedCourseDataWithStudent.students.length).toBe(1)
                expect(returnedCourseDataWithStudent.students[0]).toEqual({username: studentUser.username, name: studentUser.name, id: studentUser._id.toString()})
                

                //second check secondCourse, there should not be any student info since the studentuser is not a student on that course
                const returnedCourseDataWithOutStudent = courses.find((course) => course.uniqueName === "courses name where the user is not a student")
                expect(returnedCourseDataWithOutStudent.students.length).toBe(0)
            })
            test('getAllCourses returns null task list', async () => {
                const user = await User.findOne({username: "username"})
                apolloServer.context = {userForToken: {username: "username", name: "name", id: user._id.toString()}}
                const courseData = {
                    uniqueName: "courses name", 
                    name: "common name", 
                    teacher: "username"
                }
              
                await apolloServer.executeOperation({query: createCourse, variables: {...courseData}})
                const createdTask = await apolloServer.executeOperation({query: addTaskToCourse, variables: {courseUniqueName: "courses name", description: "this is a description for a task", deadline: new Date(Date.now()).toString()}})
                expect(createdTask.data.addTaskToCourse).toBeDefined()

                const coursesQuery = await apolloServer.executeOperation({query: getAllCourses})
                const courses = coursesQuery.data.allCourses
                const course = courses[0]
                expect(course.tasks).toBe(null)
            })
        })
        describe('getCourse query tests', () => {
            test('getCourseReturns all course data if queried by the teacher of the course', async () => {
                const user = await User.findOne({username: "username"})
                apolloServer.context = {userForToken: {username: "username", name: "name", id: user._id.toString()}}
                const courseData = {
                    uniqueName: "courses name", 
                    name: "common name", 
                    teacher: "username"
                }
                await apolloServer.executeOperation({query: createCourse, variables: {...courseData}})
                const createdTask = await apolloServer.executeOperation({query: addTaskToCourse, variables: {courseUniqueName: "courses name", description: "this is a description for a task", deadline: new Date(Date.now()).toString()}})
                const taskID = createdTask.data.addTaskToCourse.id
                
                const submission = {
                    content : "this is the answer to a task",
                    submitted: true,
                    taskId: taskID
                }
                await apolloServer.executeOperation({query: addSubmissionToCourseTask, 
                    variables: {
                    courseUniqueName: courseData.uniqueName, 
                    taskId: submission.taskId,
                    content: submission.content, 
                    submitted: submission.submitted,
                }});

                const secondUser = await User.findOne({username: "students username"})
                apolloServer.context = {userForToken: {username: "students username", name: "students name", id: secondUser._id.toString()}}
                await apolloServer.executeOperation({query: addStudentToCourse, variables: {addStudentToCourseUsername: "students username", courseUniqueName: courseData.uniqueName}})
           
                const secondSubmission = {
                    content : "this is the answer to a task",
                    submitted: true,
                    taskId: taskID
                }
                const answer = await apolloServer.executeOperation({query: addSubmissionToCourseTask, 
                    variables: {
                    courseUniqueName: courseData.uniqueName, 
                    taskId: secondSubmission.taskId,
                    content: secondSubmission.content, 
                    submitted: secondSubmission.submitted,
                }});
           

                apolloServer.context = {userForToken: {username: "username", name: "name",  id: user._id.toString()}}

                const courseInfoQuery =  await apolloServer.executeOperation({query: getCourse, variables: {uniqueName: "courses name"}})
              
                const course = courseInfoQuery.data.getCourse
              
                expect(course).toBeDefined()
                expect(course.tasks.length).toBe(1)
                expect(course.tasks[0].submissions.length).toBe(2)
                expect(course.tasks[0].submissions[0].fromUser.id).toEqual(user.id)
                expect(course.tasks[0].submissions[1].fromUser.id).toEqual(secondUser.id)

            })

            test('getCourseReturns course data but with only the submissions made by the student if queried by a student', async () => {
                const user = await User.findOne({username: "username"})
                apolloServer.context = {userForToken: {username: "username", name: "name", id: user._id.toString()}}
                const courseData = {
                    uniqueName: "courses name", 
                    name: "common name", 
                    teacher: "username"
                }
                await apolloServer.executeOperation({query: createCourse, variables: {...courseData}})
                const createdTask = await apolloServer.executeOperation({query: addTaskToCourse, variables: {courseUniqueName: "courses name", description: "this is a description for a task", deadline: new Date(Date.now()).toString()}})
                const taskID = createdTask.data.addTaskToCourse.id
                
                const submission = {
                    content : "this is the answer to a task",
                    submitted: true,
                    taskId: taskID
                }
                await apolloServer.executeOperation({query: addSubmissionToCourseTask, 
                    variables: {
                    courseUniqueName: courseData.uniqueName, 
                    taskId: submission.taskId,
                    content: submission.content, 
                    submitted: submission.submitted,
                }});

                const secondUser = await User.findOne({username: "students username"})
                apolloServer.context = {userForToken: {username: "students username", name: "students name", id: secondUser._id.toString()}}
                await apolloServer.executeOperation({query: addStudentToCourse, variables: {addStudentToCourseUsername: "students username", courseUniqueName: courseData.uniqueName}})
           
                const secondSubmission = {
                    content : "this is the answer to a task",
                    submitted: true,
                    taskId: taskID
                }
                const answer = await apolloServer.executeOperation({query: addSubmissionToCourseTask, 
                    variables: {
                    courseUniqueName: courseData.uniqueName, 
                    taskId: secondSubmission.taskId,
                    content: secondSubmission.content, 
                    submitted: secondSubmission.submitted,
                }});
             
                
                const courseInfoQuery =  await apolloServer.executeOperation({query: getCourse, variables: {uniqueName: "courses name"}})
               
                const course = courseInfoQuery.data.getCourse
              
                expect(course).toBeDefined()
                expect(course.tasks.length).toBe(1)
                expect(course.tasks[0].submissions.length).toBe(1)
                expect(course.tasks[0].submissions[0].fromUser.id).toEqual(secondUser.id)
              

            })
        })
    })



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
                students: [],
                tasks: []
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


        test('removeStudentFromCourse returns course not found if trying to remove a user from a course that does not exist', async () => {
            apolloServer.context = {userForToken: {username: "username", name: "name"}}
            const createdCourse = await apolloServer.executeOperation({query: createCourse, variables: {uniqueName: "course owned by username", name: "common name", teacher: "username"}})
            const courseWithAddedStudent = await apolloServer.executeOperation({query: addStudentToCourse, variables: {addStudentToCourseUsername: "username", courseUniqueName: "course owned by username"}})
           
            const courseAfterRemoval = await apolloServer.executeOperation({query: removeStudentFromCourse, variables: {username: "username", courseUniqueName: "course that does not exist"}})
            expect(courseAfterRemoval.errors[0].message).toEqual("Given course not found")
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

    describe('addTaskToCourse query tests', () => {
        test('addTaskToCourse creates a new task on the course with correct parameters', async () => {
            apolloServer.context = {userForToken: {username: "username", name: "name"}}
            const createdCourse = await apolloServer.executeOperation({query: createCourse, variables: {uniqueName: "course owned by username", name: "common name", teacher: "username"}})

            const task = {
                courseUniqueName: "course owned by username",
                description:  "this is the description of the course that is about testing",
                deadline: new Date("2030-06-25"),
                submissions: []
            }
            
            const newTaskQuery = await apolloServer.executeOperation({query: addTaskToCourse, variables: {courseUniqueName: task.courseUniqueName, description: task.description, deadline: task.deadline.toString()}});
         
            expect(newTaskQuery.data.addTaskToCourse.description).toEqual(task.description);
            expect(newTaskQuery.data.addTaskToCourse.submissions).toEqual([]);

            const dateReturned =  parseInt(newTaskQuery.data.addTaskToCourse.deadline)
           
            expect(new Date(dateReturned)).toEqual(task.deadline);

            const CoursesInDataBase = await Course.find({}).populate('tasks')
            expect(CoursesInDataBase.length).toBe(1)
            const course = CoursesInDataBase[0]

            expect(course.tasks.length).toEqual(1);
            expect(course.tasks[0].description).toEqual(task.description);
            expect(course.tasks[0].submissions.length).toEqual(0);
            expect(course.tasks[0].deadline).toEqual(task.deadline);

        })

        test('addTaskToCourse creates a new task on the course that already has tasks with correct parameters', async () => {
            apolloServer.context = {userForToken: {username: "username", name: "name"}}
            const createdCourse = await apolloServer.executeOperation({query: createCourse, variables: {uniqueName: "course owned by username", name: "common name", teacher: "username"}})

            const task = {
                courseUniqueName: "course owned by username",
                description:  "this is the description of the task that is about testing",
                deadline: new Date("2030-06-25"),
                submissions: []
            }
            
           await apolloServer.executeOperation({query: addTaskToCourse, variables: {courseUniqueName: task.courseUniqueName, description: task.description, deadline: task.deadline.toString()}});

            const secondTask = {
                courseUniqueName: "course owned by username",
                description:  "this is the description of a task about debugging",
                deadline: new Date("2060-12-01"),
                submissions: []
            }
            const courseWithAddedTask = await apolloServer.executeOperation({query: addTaskToCourse, variables: {courseUniqueName: secondTask.courseUniqueName, description: secondTask.description, deadline: secondTask.deadline.toString()}});
            
            
           // expect(courseWithAddedTask.data.addTaskToCourse.tasks.length).toEqual(2);
            expect(courseWithAddedTask.data.addTaskToCourse.description).toEqual(secondTask.description);
            expect(courseWithAddedTask.data.addTaskToCourse.submissions).toEqual([]);
           
            const dateReturned =  parseInt(courseWithAddedTask.data.addTaskToCourse.deadline)
            expect(new Date(dateReturned)).toEqual(secondTask.deadline);

            expect(courseWithAddedTask.data.addTaskToCourse.description).toEqual(secondTask.description);
            expect(courseWithAddedTask.data.addTaskToCourse.submissions).toEqual([]);
            const secondDateReturned =  parseInt(courseWithAddedTask.data.addTaskToCourse.deadline)
            expect(new Date(secondDateReturned)).toEqual(secondTask.deadline);



            const CoursesInDataBase = await Course.find({}).populate('tasks')
            expect(CoursesInDataBase.length).toBe(1)
            
            const course = CoursesInDataBase[0]
            expect(course.tasks.length).toEqual(2);
            expect(course.tasks[0].description).toEqual(task.description);
            expect(course.tasks[0].submissions.length).toEqual(0);
            expect(course.tasks[0].deadline).toEqual(task.deadline);


            expect(course.tasks[1].description).toEqual(secondTask.description);
            expect(course.tasks[1].submissions.length).toEqual(0);
            expect(course.tasks[1].deadline).toEqual(secondTask.deadline);

        

        })
      
        test('addTaskToCourse does not create a new task on the course if the user is not the teacher of the course', async () => {
            apolloServer.context = {userForToken: {username: "username", name: "name"}}
            const createdCourse = await apolloServer.executeOperation({query: createCourse, variables: {uniqueName: "course owned by username", name: "common name", teacher: "username"}})

            apolloServer.context = {userForToken: {username: "this user is not the teacher of the course", name: "name"}}
            const task = {
                courseUniqueName: "course owned by username",
                description:  "this is the description of the course that is about testing",
                deadline: new Date("2030-06-25"),
                submissions: []
            }
            
            const response = await apolloServer.executeOperation({query: addTaskToCourse, variables: {courseUniqueName: task.courseUniqueName, description: task.description, deadline: task.deadline.toString()}});
            expect(response.data.addTaskToCourse).toBe(null)
            expect(response.errors[0].message).toBe("Unauthorized")
            
            const CoursesInDataBase = await Course.find({}).populate('tasks')
            expect(CoursesInDataBase.length).toBe(1)
            
            const course = CoursesInDataBase[0]

          
            expect(course.tasks).toEqual([])

        })

        test('addTaskToCourse returns Given course not found error if the course of the task does not exist', async () => {
            apolloServer.context = {userForToken: {username: "username", name: "name"}}
            const createdCourse = await apolloServer.executeOperation({query: createCourse, variables: {uniqueName: "course owned by username", name: "common name", teacher: "username"}})

            const task = {
                courseUniqueName: "this course does not exist",
                description:  "this is the description of the course that is about testing",
                deadline: new Date("2030-06-25"),
                submissions: []
            }
            
            const response = await apolloServer.executeOperation({query: addTaskToCourse, variables: {courseUniqueName: task.courseUniqueName, description: task.description, deadline: task.deadline.toString()}});
         
            expect(response.data.addTaskToCourse).toBe(null)
            expect(response.errors[0].message).toBe("Given course not found")
            
            const CoursesInDataBase = await Course.find({}).populate('tasks')
            expect(CoursesInDataBase.length).toBe(1)
            
            const course = CoursesInDataBase[0]

          
            expect(course.tasks).toEqual([])

        })
    })

    describe('removeTaskFromCourse tests', ()=> {
        test('removeTaskFromCourse removes a task correctly from database', async () => {
            const user = await User.findOne({username: "username"})
            apolloServer.context = {userForToken: user}

            const course = {
                uniqueName:  "course",
                name: "common name"
            }
            const courseCreateQuery = await apolloServer.executeOperation({query: createCourse, variables: {uniqueName: course.uniqueName, name: course.name, teacher: ""}})
           

            const notToBeRemovedTask = {
                description: "this task should not be removed",
                deadline: new Date("2030-06-25"),
                submissions: []
            }
            notToBeRemovedTaskQuery = await apolloServer.executeOperation({query: addTaskToCourse, variables: {
                courseUniqueName: course.uniqueName, 
                description: notToBeRemovedTask.description, 
                deadline: notToBeRemovedTask.deadline.toString()
            }});
            expect(notToBeRemovedTaskQuery.data.addTaskToCourse).toBeDefined()


            const task = {
                description: "this is the description of the task that is about testing",
                deadline: new Date("2030-06-25"),
                submissions: []
            }
            const taskCreateQuery = await apolloServer.executeOperation({query: addTaskToCourse, variables: {
                courseUniqueName: course.uniqueName, 
                description: task.description, 
                deadline: task.deadline.toString()
            }});
            const createdTask = taskCreateQuery.data.addTaskToCourse
            expect(createdTask).toBeDefined()
           
            const response = await apolloServer.executeOperation({query: removeTaskFromCourse, variables: {courseUniqueName: course.uniqueName, taskId: createdTask.id}})
         
            expect(response.data.removeTaskFromCourse).toBe(true)

            const modifiedCourse = await Course.findOne({uniqueName: course.uniqueName})
          
            expect(modifiedCourse.tasks.length).toBe(1)
            expect(modifiedCourse.tasks[0].description).toEqual("this task should not be removed")


            
        })
       
        test('removeTaskFromCourse returns Unauthorized if the user is not a teacher of the course', async () => {
            const user = await User.findOne({username: "username"})
            apolloServer.context = {userForToken: user}

            const course = {
                uniqueName:  "course",
                name: "common name"
            }
            const courseCreateQuery = await apolloServer.executeOperation({query: createCourse, variables: {uniqueName: course.uniqueName, name: course.name, teacher: ""}})
        
            const task = {
                description: "this is the description of the task that is about testing",
                deadline: new Date("2030-06-25"),
                submissions: []
            }
            const taskCreateQuery = await apolloServer.executeOperation({query: addTaskToCourse, variables: {
                courseUniqueName: course.uniqueName, 
                description: task.description, 
                deadline: task.deadline.toString()
            }});
            const createdTask = taskCreateQuery.data.addTaskToCourse
            expect(createdTask).toBeDefined()


            const otherUser = await User.findOne({username: "students username"})
            apolloServer.context = {userForToken: otherUser}
            const response = await apolloServer.executeOperation({query: removeTaskFromCourse, variables: {courseUniqueName: course.uniqueName, taskId: createdTask.id}})
            expect(response.errors[0].message).toEqual("Unauthorized")
            expect(response.data.removeTaskFromCourse).toBe(null)

            const modifiedCourse = await Course.findOne({uniqueName: course.uniqueName})
            expect(modifiedCourse.tasks.length).toBe(1)
        })

        test('removeTaskFromCourse returns given course not found if trying to remove task from a not existing course ', async () => {
            const user = await User.findOne({username: "username"})
            apolloServer.context = {userForToken: user}

            const course = {
                uniqueName:  "course",
                name: "common name"
            }
            const courseCreateQuery = await apolloServer.executeOperation({query: createCourse, variables: {uniqueName: course.uniqueName, name: course.name, teacher: ""}})
        
            const task = {
                description: "this is the description of the task that is about testing",
                deadline: new Date("2030-06-25"),
                submissions: []
            }
            const taskCreateQuery = await apolloServer.executeOperation({query: addTaskToCourse, variables: {
                courseUniqueName: course.uniqueName, 
                description: task.description, 
                deadline: task.deadline.toString()
            }});
            const createdTask = taskCreateQuery.data.addTaskToCourse
            expect(createdTask).toBeDefined()

            const response = await apolloServer.executeOperation({query: removeTaskFromCourse, variables: {courseUniqueName: "this course does not exist", taskId: createdTask.id}})
            expect(response.errors[0].message).toEqual("Given course not found")
            expect(response.data.removeTaskFromCourse).toBe(null)

            const modifiedCourse = await Course.findOne({uniqueName: course.uniqueName})
            expect(modifiedCourse.tasks.length).toBe(1)
        })
        
        test('removeTaskFromCourse returns given task not found if trying to remove an not existing task from a course ', async () => {
            const user = await User.findOne({username: "username"})
            apolloServer.context = {userForToken: user}

            const course = {
                uniqueName:  "course",
                name: "common name"
            }
            const courseCreateQuery = await apolloServer.executeOperation({query: createCourse, variables: {uniqueName: course.uniqueName, name: course.name, teacher: ""}})
        
            const task = {
                description: "this is the description of the task that is about testing",
                deadline: new Date("2030-06-25"),
                submissions: []
            }
            const taskCreateQuery = await apolloServer.executeOperation({query: addTaskToCourse, variables: {
                courseUniqueName: course.uniqueName, 
                description: task.description, 
                deadline: task.deadline.toString()
            }});
            const createdTask = taskCreateQuery.data.addTaskToCourse
            expect(createdTask).toBeDefined()

            const response = await apolloServer.executeOperation({query: removeTaskFromCourse, variables: {courseUniqueName: course.uniqueName, taskId: "abc1234"}})
            expect(response.errors[0].message).toEqual("Given task not found")
            expect(response.data.removeTaskFromCourse).toBe(null)

            const modifiedCourse = await Course.findOne({uniqueName: course.uniqueName})
            expect(modifiedCourse.tasks.length).toBe(1)
        })
        
    })

    describe('removeCourse tests', () => {
        test('removeCourse removes course and its child objects from database', async ()=>{
            apolloServer.context = {userForToken: {username: "username", name: "name"}}

            const courseToBeRemoved = {
                uniqueName:  "course to be removed",
                name: "common name"
            }

            const courseThatShouldNotBeRemoved = {
                uniqueName:  "course that should not be removed",
                name: "common name"
            }
            const courseToRemove = await apolloServer.executeOperation({query: createCourse, variables: {uniqueName: courseToBeRemoved.uniqueName, name: courseToBeRemoved.name, teacher: ""}})
            const courseToStay = await apolloServer.executeOperation({query: createCourse, variables: {uniqueName: courseThatShouldNotBeRemoved.uniqueName, name: courseThatShouldNotBeRemoved.name, teacher: ""}})

            const task = {
                description:  "this is the description of the course that is about testing",
                deadline: new Date("2030-06-25"),
                submissions: []
            }
            const taskCreateQuery = await apolloServer.executeOperation({query: addTaskToCourse, variables: {
                courseUniqueName: courseToBeRemoved.uniqueName, 
                description: task.description, 
                deadline: task.deadline.toString()
            }});
          
            const submission = {
                content : "this is the answer to a task",
                submitted: true,
                taskId: taskCreateQuery.data.addTaskToCourse.id
            }
            await apolloServer.executeOperation({query: addSubmissionToCourseTask,variables: {
                courseUniqueName: courseToBeRemoved.uniqueName, 
                taskId: submission.taskId,
                content: submission.content, 
                submitted: submission.submitted,
            }});
            
            const courseRemoveQuery = await apolloServer.executeOperation({query: removeCourse, variables: {uniqueName: courseToBeRemoved.uniqueName}})
            expect(courseRemoveQuery.data.removeCourse).toBe(true)

            const coursesInDB = await Course.find({})
            expect(coursesInDB.length).toBe(1)
            expect(coursesInDB[0].uniqueName).toEqual(courseThatShouldNotBeRemoved.uniqueName)
            expect(coursesInDB[0].name).toEqual(courseThatShouldNotBeRemoved.name)
            expect(coursesInDB[0].teacher).toBeDefined() 

            const tasksInDB = await Task.find({})
            expect(tasksInDB.length).toBe(0)
        })

        test('removeCourse query returns Unauthorized if user that is not a teacher tries to remove the course', async () => {
            apolloServer.context = {userForToken: {username: "username", name: "name"}}

            const courseToNotBeRemoved = {
                uniqueName:  "course to be removed",
                name: "common name"
            }
            await apolloServer.executeOperation({query: createCourse, variables: {uniqueName: courseToNotBeRemoved.uniqueName, name: courseToNotBeRemoved.name, teacher: ""}})
            
            apolloServer.context = {userForToken: {username: "students username", name: "another name"}}
            
            const courseRemoveQuery = await apolloServer.executeOperation({query: removeCourse, variables: {uniqueName: courseToNotBeRemoved.uniqueName}})
            expect(courseRemoveQuery.data.removeCourse).toBe(null)
            expect(courseRemoveQuery.errors[0].message).toBe("Unauthorized")


            const coursesInDB = await Course.find({})
            expect(coursesInDB.length).toBe(1)
            expect(coursesInDB[0].uniqueName).toEqual(courseToNotBeRemoved.uniqueName)
            expect(coursesInDB[0].name).toEqual(courseToNotBeRemoved.name)
            expect(coursesInDB[0].teacher).toBeDefined() 
        })

        test('removeCourse query returns No given course found! if trying to remove a course that does not exist', async () => {
            apolloServer.context = {userForToken: {username: "username", name: "name"}}

            const courseToNotBeRemoved = {
                uniqueName:  "course to be removed",
                name: "common name"
            }
            await apolloServer.executeOperation({query: createCourse, variables: {uniqueName: courseToNotBeRemoved.uniqueName, name: courseToNotBeRemoved.name, teacher: ""}})
            
            const courseRemoveQuery = await apolloServer.executeOperation({query: removeCourse, variables: {uniqueName: "this course does not exist"}})
            expect(courseRemoveQuery.data.removeCourse).toBe(null)
            expect(courseRemoveQuery.errors[0].message).toBe("No given course found!")


            const coursesInDB = await Course.find({})
            expect(coursesInDB.length).toBe(1)
            expect(coursesInDB[0].uniqueName).toEqual(courseToNotBeRemoved.uniqueName)
            expect(coursesInDB[0].name).toEqual(courseToNotBeRemoved.name)
            expect(coursesInDB[0].teacher).toBeDefined() 
        })
    })

    describe('addSubmissionToCourseTask tests', () => {
        test('user can create a submission to a task', async () => {
            const userQuery = await User.findOne({username: "username"})
            const userid = userQuery._id.toString()
            apolloServer.context = {userForToken: {username: "username", name:"name", id: userid}}
            const course = {uniqueName: "course owned by username", name: "common name", teacher: "username", tasks: []}
            const createdCourse = await apolloServer.executeOperation({query: createCourse, variables: course})
            const task = {
                description:  "this is the description of a task that is about testing",
                deadline: new Date("2030-06-25"),
                submissions: []
            }
           
            const createdTask = await apolloServer.executeOperation({query: addTaskToCourse, variables: {courseUniqueName: course.uniqueName, description: task.description, deadline: task.deadline.toString()}});
            const taskID = createdTask.data.addTaskToCourse.id

            const submission = {
                content : "this is the answer to a task",
                submitted: true,
                taskId: taskID
            }
            
            const response = await apolloServer.executeOperation({query: addSubmissionToCourseTask, 
                variables: {
                courseUniqueName: course.uniqueName, 
                taskId: submission.taskId,
                content: submission.content, 
                submitted: submission.submitted,
            }});
            
          
            
            const createdSubmission = response.data.addSubmissionToCourseTask
            expect(createdSubmission.content).toEqual(submission.content)
            expect(createdSubmission.submitted).toEqual(submission.submitted)
            expect(createdSubmission.fromUser.username).toEqual("username")
            expect(createdSubmission.fromUser.name).toEqual("name")
         
            expect(new Date(Number(createdSubmission.submittedDate)).toISOString().slice(0, 16)).toEqual(new Date(Date.now()).toISOString().slice(0, 16))
           
            
            const courseInDB = await Course.findOne({courseUniqueName: course.uniqueName}).populate('tasks')
            expect(courseInDB.tasks[0].description).toEqual(task.description)
            expect(courseInDB.tasks[0].deadline).toEqual(task.deadline)
            
            expect(courseInDB.tasks[0].submissions.length).toBe(1)
            expect(courseInDB.tasks[0].submissions[0].content).toEqual(submission.content)
            expect(courseInDB.tasks[0].submissions[0].submitted).toEqual(submission.submitted)
            expect(courseInDB.tasks[0].submissions[0].fromUser.toString()).toEqual(userid)
            expect(new Date(courseInDB.tasks[0].submissions[0].submittedDate).toISOString().slice(0, 16)).toEqual(new Date(Date.now()).toISOString().slice(0, 16))
        })
        test('user can create a submission to a task only once', async () => {
            const userQuery = await User.findOne({username: "username"})
            const userid = userQuery._id.toString()
            apolloServer.context = {userForToken: {username: userQuery.username, name: userQuery.name, id: userid, _id: userQuery._id}}
            const course = {uniqueName: "course owned by username", name: "common name", teacher: "username", tasks: []}
            const createdCourse = await apolloServer.executeOperation({query: createCourse, variables: course})
            const task = {
                description:  "this is the description of a task that is about testing",
                deadline: new Date("2030-06-25"),
                submissions: []
            }
           
            const createdTask = await apolloServer.executeOperation({query: addTaskToCourse, variables: {courseUniqueName: course.uniqueName, description: task.description, deadline: task.deadline.toString()}});
            const taskID = createdTask.data.addTaskToCourse.id

            const submission = {
                content : "this is the answer to a task",
                submitted: true,
                taskId: taskID
            }
            
            const response = await apolloServer.executeOperation({query: addSubmissionToCourseTask, 
                variables: {
                courseUniqueName: course.uniqueName, 
                taskId: submission.taskId,
                content: submission.content, 
                submitted: submission.submitted,
            }});
            const createdSubmission = response.data.addSubmissionToCourseTask
            expect(createdSubmission.content).toEqual(submission.content)
            expect(createdSubmission.submitted).toEqual(submission.submitted)
            expect(createdSubmission.fromUser.username).toEqual("username")
            expect(createdSubmission.fromUser.name).toEqual("name")
            
            const secondSubmission = {
                content : "this is the second answer to a task by the same user",
                submitted: true,
                taskId: taskID
            }
            const secondResponse = await apolloServer.executeOperation({query: addSubmissionToCourseTask, variables: {
                courseUniqueName: course.uniqueName,
                taskId: secondSubmission.taskId,
                content: secondSubmission.content,
                submitted: secondSubmission.submitted
            }})
            expect(secondResponse.errors[0].message).toEqual("Given user is has already answered the question")
            expect(secondResponse.data.addSubmissionToCourseTask).toBe(null)


            const courseInDB = await Course.findOne({courseUniqueName: course.uniqueName}).populate('tasks')
            expect(courseInDB.tasks[0].description).toEqual(task.description)
            expect(courseInDB.tasks[0].deadline).toEqual(task.deadline)
            
            expect(courseInDB.tasks[0].submissions.length).toBe(1)
            expect(courseInDB.tasks[0].submissions[0].content).toEqual(submission.content)
            expect(courseInDB.tasks[0].submissions[0].submitted).toEqual(submission.submitted)
            expect(courseInDB.tasks[0].submissions[0].fromUser.toString()).toEqual(userid)
        })
    })

    describe('removeSubmissionFromCourseTask tests', () => {
        test('removeSubmissionFromCourseTask modifies database state correctly when a task has one submission', async () => {
            const userQuery = await User.findOne({username: "username"})
            apolloServer.context = {userForToken: userQuery}
            const course = {uniqueName: "course owned by username", name: "common name", teacher: "username", tasks: []}
            const createdCourse = await apolloServer.executeOperation({query: createCourse, variables: course})
            expect(createdCourse.data.createCourse).toBeDefined()

            const task = {
                description:  "this is the description of a task that is about testing",
                deadline: new Date("2030-06-25"),
                submissions: []
            }
            const createdTask = await apolloServer.executeOperation({query: addTaskToCourse, variables: {courseUniqueName: course.uniqueName, description: task.description, deadline: task.deadline.toString()}});
            const taskID = createdTask.data.addTaskToCourse.id

            const submission = {
                content : "this is the answer to a task and should be removed",
                submitted: true,
                taskId: taskID
            }
            const submissionCreateQuery = await apolloServer.executeOperation({query: addSubmissionToCourseTask, 
                variables: {
                courseUniqueName: course.uniqueName, 
                taskId: submission.taskId,
                content: submission.content, 
                submitted: submission.submitted,
            }});
            const submissionID = submissionCreateQuery.data.addSubmissionToCourseTask.id
           
            const removedQuery = await apolloServer.executeOperation({query: removeSubmissionFromCourseTask, variables: {courseUniqueName: course.uniqueName, taskId: taskID,  submissionId: submissionID}})
            expect(removedQuery.data.removeSubmissionFromCourseTask).toBe(true)
            const courseInDB = await Course.findOne({uniqueName: course.uniqueName})
            const taskInDB = courseInDB.tasks[0]
            expect(taskInDB.submissions.length).toBe(0)


        })
        test('removeSubmissionFromCourseTask modifies database state correctly when a task has 2 submissions', async () => {
            const userQuery = await User.findOne({username: "username"})
            apolloServer.context = {userForToken: userQuery}
            const course = {uniqueName: "course owned by username", name: "common name", teacher: "username", tasks: []}
            const createdCourse = await apolloServer.executeOperation({query: createCourse, variables: course})
            expect(createdCourse.data.createCourse).toBeDefined()

            const task = {
                description:  "this is the description of a task that is about testing",
                deadline: new Date("2030-06-25"),
                submissions: []
            }
            const createdTask = await apolloServer.executeOperation({query: addTaskToCourse, variables: {courseUniqueName: course.uniqueName, description: task.description, deadline: task.deadline.toString()}});
           
            const taskID = createdTask.data.addTaskToCourse.id
           
            const otherUserQuery = await User.findOne({username: "students username"})
            apolloServer.context = {userForToken: otherUserQuery}
            await apolloServer.executeOperation({query: addStudentToCourse, variables: {courseUniqueName: "course owned by username", addStudentToCourseUsername: "students username"}})
           
            const submissionToNotBeRemoved = {
                content : "this is the answer to a task and should not be removed",
                submitted: true,
                taskId: taskID
            }
            await apolloServer.executeOperation({query: addSubmissionToCourseTask, 
                variables: {
                courseUniqueName: course.uniqueName, 
                taskId: submissionToNotBeRemoved.taskId,
                content: submissionToNotBeRemoved.content, 
                submitted: submissionToNotBeRemoved.submitted,
            }});
        
            apolloServer.context = {userForToken: userQuery}

            const submission = {
                content : "this is the answer to a task and should be removed",
                submitted: true,
                taskId: taskID
            }
            const submissionCreateQuery = await apolloServer.executeOperation({query: addSubmissionToCourseTask, 
                variables: {
                courseUniqueName: course.uniqueName, 
                taskId: submission.taskId,
                content: submission.content, 
                submitted: submission.submitted,
            }});
            const submissionID = submissionCreateQuery.data.addSubmissionToCourseTask.id
           
            const removedQuery = await apolloServer.executeOperation({query: removeSubmissionFromCourseTask, variables: {courseUniqueName: course.uniqueName, taskId: taskID,  submissionId: submissionID}})
            expect(removedQuery.data.removeSubmissionFromCourseTask).toBe(true)
            const courseInDB = await Course.findOne({uniqueName: course.uniqueName})
            const taskInDB = courseInDB.tasks[0]
            expect(taskInDB.submissions.length).toBe(1)
         
            expect(taskInDB.submissions[0].fromUser.toString()).toEqual(otherUserQuery.id)
            expect(taskInDB.submissions[0].content).toEqual("this is the answer to a task and should not be removed")

        })

        test('removeSubmissionFromCourseTask student can not remove other students submission', async () => {
            await helpers.logIn("username", apolloServer)
            const course = await helpers.createCourse("course unique name", "name of course", [], apolloServer)
            const task = await  helpers.createTask(course, "this is a task", new Date(Date.now()), [], apolloServer)
            const submission = await helpers.createSubmission(course, task.id, "this is an answer", true, apolloServer);
            
            await helpers.logIn("students username", apolloServer)
            const removedQuery = await apolloServer.executeOperation({query: removeSubmissionFromCourseTask, 
                variables: {courseUniqueName: course.uniqueName, taskId: task.id,  submissionId: submission.id}})
            expect(removedQuery.errors[0].message).toEqual("Unauthorized")
            expect(removedQuery.data.removeSubmissionFromCourseTask).toEqual(null)
            
            const courseInDB = await Course.findOne({uniqueName: "course unique name"})
            expect(courseInDB.tasks[0].submissions.length).toBe(1)
            expect(courseInDB.tasks[0].submissions[0].content).toEqual(submission.content)
            expect(courseInDB.tasks[0].submissions[0].fromUser.toString()).toEqual(submission.fromUser.id)
        })

        test('removeSubmissionFromCourseTask teacher can remove students submission', async () => {
            await helpers.logIn("username", apolloServer)
            const course = await helpers.createCourse("course unique name", "name of course", [], apolloServer)
            const task = await  helpers.createTask(course, "this is a task", new Date(Date.now()), [], apolloServer)
             
            await helpers.logIn("students username", apolloServer)
            await apolloServer.executeOperation({query: addStudentToCourse, variables: {courseUniqueName: "course unique name", addStudentToCourseUsername: "students username"}})
            const submission = await helpers.createSubmission(course, task.id, "this is an answer", true, apolloServer);
          
            await helpers.logIn("username", apolloServer)
            const removedQuery = await apolloServer.executeOperation({query: removeSubmissionFromCourseTask, 
                variables: {courseUniqueName: course.uniqueName, taskId: task.id,  submissionId: submission.id}})
            expect(removedQuery.data.removeSubmissionFromCourseTask).toEqual(true)
            
            const courseInDB = await Course.findOne({uniqueName: "course unique name"})
            expect(courseInDB.tasks[0].submissions.length).toBe(0)
        })

        test('removeSubmissionFromCourseTask returns course not found if course does not exist', async () => {
            await helpers.logIn("username", apolloServer)
            const course = await helpers.createCourse("course unique name", "name of course", [], apolloServer)
            const task = await  helpers.createTask(course, "this is a task", new Date(Date.now()), [], apolloServer)
            const submission = await helpers.createSubmission(course, task.id, "this is an answer", true, apolloServer);
          
           
            const removedQuery = await apolloServer.executeOperation({query: removeSubmissionFromCourseTask, 
                variables: {courseUniqueName: "this course does not exist", taskId: task.id,  submissionId: submission.id}})
           
            expect(removedQuery.errors[0].message).toEqual("Given course not found")
            expect(removedQuery.data.removeSubmissionFromCourseTask).toEqual(null)
            
            const courseInDB = await Course.findOne({uniqueName: "course unique name"})
            expect(courseInDB.tasks[0].submissions.length).toBe(1)
            expect(courseInDB.tasks[0].submissions[0].content).toEqual(submission.content)
            expect(courseInDB.tasks[0].submissions[0].fromUser.toString()).toEqual(submission.fromUser.id)
        })

        test('removeSubmissionFromCourseTask returns task not found if task does not exist', async () => {
            await helpers.logIn("username", apolloServer)
            const course = await helpers.createCourse("course unique name", "name of course", [], apolloServer)
            const task = await  helpers.createTask(course, "this is a task", new Date(Date.now()), [], apolloServer)
            const submission = await helpers.createSubmission(course, task.id, "this is an answer", true, apolloServer);
          
            const anotherCourse = await helpers.createCourse("second course", "name of course", [], apolloServer)
            const anotherTask = await  helpers.createTask(anotherCourse, "this is a different task", new Date(Date.now()), [], apolloServer)
            const differentSubmission = await helpers.createSubmission(anotherCourse, anotherTask.id, "this is an different answer", true, apolloServer);
        

            const removedQuery = await apolloServer.executeOperation({query: removeSubmissionFromCourseTask, 
                variables: {courseUniqueName: "course unique name", taskId: anotherTask.id,  submissionId: submission.id}})
          
            expect(removedQuery.errors[0].message).toEqual("Given task not found")
            expect(removedQuery.data.removeSubmissionFromCourseTask).toEqual(null)
            
            const courseInDB = await Course.findOne({uniqueName: "course unique name"})
            expect(courseInDB.tasks[0].submissions.length).toBe(1)
            expect(courseInDB.tasks[0].submissions[0].content).toEqual(submission.content)
            expect(courseInDB.tasks[0].submissions[0].fromUser.toString()).toEqual(submission.fromUser.id)

            const secondCourseInDB = await Course.findOne({uniqueName: "second course"})
            expect(secondCourseInDB.tasks[0].submissions.length).toBe(1)
            expect(secondCourseInDB.tasks[0].submissions[0].content).toEqual(differentSubmission.content)
            expect(secondCourseInDB.tasks[0].submissions[0].fromUser.toString()).toEqual(differentSubmission.fromUser.id)
        })

        test('removeSubmissionFromCourseTask returns submission not found if submission does not exist', async () => {
            await helpers.logIn("username", apolloServer)
            const course = await helpers.createCourse("course unique name", "name of course", [], apolloServer)
            const task = await  helpers.createTask(course, "this is a task", new Date(Date.now()), [], apolloServer)
            const submission = await helpers.createSubmission(course, task.id, "this is an answer", true, apolloServer);
          
            const anotherCourse = await helpers.createCourse("second course", "name of course", [], apolloServer)
            const anotherTask = await  helpers.createTask(anotherCourse, "this is a different task", new Date(Date.now()), [], apolloServer)
            const differentSubmission = await helpers.createSubmission(anotherCourse, anotherTask.id, "this is an different answer", true, apolloServer);
        

            const removedQuery = await apolloServer.executeOperation({query: removeSubmissionFromCourseTask, 
                variables: {courseUniqueName: "course unique name", taskId: task.id,  submissionId: differentSubmission.id}})
          
            expect(removedQuery.errors[0].message).toEqual("Given submission not found")
            expect(removedQuery.data.removeSubmissionFromCourseTask).toEqual(null)
            
            const courseInDB = await Course.findOne({uniqueName: "course unique name"})
            expect(courseInDB.tasks[0].submissions.length).toBe(1)
            expect(courseInDB.tasks[0].submissions[0].content).toEqual(submission.content)
            expect(courseInDB.tasks[0].submissions[0].fromUser.toString()).toEqual(submission.fromUser.id)

            const secondCourseInDB = await Course.findOne({uniqueName: "second course"})
            expect(secondCourseInDB.tasks[0].submissions.length).toBe(1)
            expect(secondCourseInDB.tasks[0].submissions[0].content).toEqual(differentSubmission.content)
            expect(secondCourseInDB.tasks[0].submissions[0].fromUser.toString()).toEqual(differentSubmission.fromUser.id)
        })


    })
    describe('modify submission tests', () => {
        test('user can modify a submission made by the user', async () => {
            const user = await helpers.logIn("username", apolloServer)
            const course = await helpers.createCourse("course unique name", "name of course", [], apolloServer)
            const task = await  helpers.createTask(course, "this is a task", new Date(Date.now()), [], apolloServer)
            const submission = await helpers.createSubmission(course, task.id, "this is an answer", false, apolloServer);


            const newContent = "this is modified content"
            const newSubmitted = true
            const modifySubmissionQuery = await apolloServer.executeOperation({query: modifySubmission, 
                variables: 
                {courseUniqueName: course.uniqueName, taskId: task.id, submissionId: submission.id, content: newContent, submitted: newSubmitted}})
         
            const returnedModifiedSubmission = modifySubmissionQuery.data.modifySubmission
            expect(returnedModifiedSubmission.content).toEqual(newContent)
            expect(returnedModifiedSubmission.submitted).toEqual(newSubmitted)
            expect(returnedModifiedSubmission.fromUser).toEqual({username: user.username, name: user.name, id: user.id})
            
            const courseInDB = await Course.findOne({uniqueName: "course unique name"})
            const tasks = courseInDB.tasks
            expect(tasks.length).toBe(1)
            expect(tasks[0].submissions.length).toBe(1)
            
            const submissionInDB = tasks[0].submissions[0]
            expect(submissionInDB.content).toEqual(newContent)
            expect(submissionInDB.submitted).toEqual(newSubmitted)
            expect(submissionInDB.fromUser.toString()).toEqual(user.id)


        })

        test('user can not modify a returned submission', async () => {
            const user = await helpers.logIn("username", apolloServer)
            const course = await helpers.createCourse("course unique name", "name of course", [], apolloServer)
            const task = await  helpers.createTask(course, "this is a task", new Date(Date.now()), [], apolloServer)
            const submission = await helpers.createSubmission(course, task.id, "this is an answer", true, apolloServer);


            const newContent = "this is modified content"
            const newSubmitted = false
            const modifySubmissionQuery = await apolloServer.executeOperation({query: modifySubmission, 
                variables: 
                {courseUniqueName: course.uniqueName, taskId: task.id, submissionId: submission.id, content: newContent, submitted: newSubmitted}})
         
            expect(modifySubmissionQuery.errors[0].message).toEqual("This submission has already been returned")
            expect(modifySubmissionQuery.data.modifySubmission).toEqual(null)
            
            const courseInDB = await Course.findOne({uniqueName: "course unique name"})
            const tasks = courseInDB.tasks
            expect(tasks.length).toBe(1)
            expect(tasks[0].submissions.length).toBe(1)
            
            const submissionInDB = tasks[0].submissions[0]
            expect(submissionInDB.content).toEqual(submission.content)
            expect(submissionInDB.submitted).toEqual(submission.submitted)
            expect(submissionInDB.fromUser.toString()).toEqual(user.id)


        })
        test('user can not modify a submission made by another user', async () => {
            const user = await helpers.logIn("username", apolloServer)
            const course = await helpers.createCourse("course unique name", "name of course", [], apolloServer)
            const task = await  helpers.createTask(course, "this is a task", new Date(Date.now()), [], apolloServer)
            const submission = await helpers.createSubmission(course, task.id, "this is an answer", true, apolloServer);

            const anotherUser = await helpers.logIn("students username", apolloServer)
            const newContent = "this is modified content"
            const newSubmitted = false
            const modifySubmissionQuery = await apolloServer.executeOperation({query: modifySubmission, 
                variables: 
                {courseUniqueName: course.uniqueName, taskId: task.id, submissionId: submission.id, content: newContent, submitted: newSubmitted}})
            expect(modifySubmissionQuery.errors[0].message).toEqual("Unauthorized")
            expect(modifySubmissionQuery.data.modifySubmission).toEqual(null)
            
            const courseInDB = await Course.findOne({uniqueName: "course unique name"})
            const tasks = courseInDB.tasks
            expect(tasks.length).toBe(1)
            expect(tasks[0].submissions.length).toBe(1)
            
            const submissionInDB = tasks[0].submissions[0]
            expect(submissionInDB.content).toEqual(submission.content)
            expect(submissionInDB.submitted).toEqual(submission.submitted)
            expect(submissionInDB.fromUser.toString()).toEqual(submission.fromUser.id)


        })
        test('user must be logged in to modify a submission', async () => {
            const user = await helpers.logIn("username", apolloServer)
            const course = await helpers.createCourse("course unique name", "name of course", [], apolloServer)
            const task = await  helpers.createTask(course, "this is a task", new Date(Date.now()), [], apolloServer)
            const submission = await helpers.createSubmission(course, task.id, "this is an answer", true, apolloServer);

            apolloServer.context = {userForToken: null}
            const newContent = "this is modified content"
            const newSubmitted = false
            const modifySubmissionQuery = await apolloServer.executeOperation({query: modifySubmission, 
                variables: 
                {courseUniqueName: course.uniqueName, taskId: task.id, submissionId: submission.id, content: newContent, submitted: newSubmitted}})
            expect(modifySubmissionQuery.errors[0].message).toEqual("Unauthorized")
            expect(modifySubmissionQuery.data.modifySubmission).toEqual(null)
            
            const courseInDB = await Course.findOne({uniqueName: "course unique name"})
            const tasks = courseInDB.tasks
            expect(tasks.length).toBe(1)
            expect(tasks[0].submissions.length).toBe(1)
            
            const submissionInDB = tasks[0].submissions[0]
            expect(submissionInDB.content).toEqual(submission.content)
            expect(submissionInDB.submitted).toEqual(submission.submitted)
            expect(submissionInDB.fromUser.toString()).toEqual(submission.fromUser.id)


        })

        test('modify submission returns course not found if given course is not found', async () => {
            const user = await helpers.logIn("username", apolloServer)
            
            const newContent = "this is modified content"
            const newSubmitted = false
            const modifySubmissionQuery = await apolloServer.executeOperation({query: modifySubmission, 
                variables: 
                {courseUniqueName: "course does not exist", taskId: "abc1234", submissionId: "abc43231", content: newContent, submitted: newSubmitted}})
            
            expect(modifySubmissionQuery.errors[0].message).toEqual("Given course not found")

            const courses = await Course.find({})
            expect(courses).toEqual([])
        })  

        test('modify submission returns task not found if given task is not found', async () => {
            const user = await helpers.logIn("username", apolloServer)
            const course = await helpers.createCourse("course unique name", "name of course", [], apolloServer)


            const anotherCourse = await helpers.createCourse("second course unique name", "name of course", [], apolloServer)
            const taskOnAnotherCourse = await  helpers.createTask(anotherCourse, "this is a task in another course", new Date(Date.now()), [], apolloServer)
          

            const newContent = "this is modified content"
            const newSubmitted = false
            const modifySubmissionQuery = await apolloServer.executeOperation({query: modifySubmission, 
                variables: 
                {courseUniqueName: course.uniqueName, taskId: taskOnAnotherCourse.id, submissionId: "abc43231", content: newContent, submitted: newSubmitted}})
            
            expect(modifySubmissionQuery.errors[0].message).toEqual("Given task not found")

            const courseInDB = await Course.findOne({uniqueName: course.uniqueName})
            expect(courseInDB.tasks).toEqual(course.tasks)

            const anotherCourseInDB = await Course.findOne({uniqueName: anotherCourse.uniqueName})
           
            expect(anotherCourseInDB.tasks.length).toEqual(1)
            expect(anotherCourseInDB.tasks[0].submissions.length).toEqual(0)
        })  


        test('modify submission returns submission not found if given submission is not found', async () => {
            const user = await helpers.logIn("username", apolloServer)
            const course = await helpers.createCourse("course unique name", "name of course", [], apolloServer)
            const task = await  helpers.createTask(course, "this is a task in course", new Date(Date.now()), [], apolloServer)
            const wrongSubmssionOnCourse = await helpers.createSubmission(course, task.id, "this is an answer that should not be modified", true, apolloServer);


            const anotherCourse = await helpers.createCourse("second course unique name", "name of course", [], apolloServer)
            const taskOnAnotherCourse = await  helpers.createTask(anotherCourse, "this is a task in another course", new Date(Date.now()), [], apolloServer)
            const submissionOnAnotherTask = await helpers.createSubmission(anotherCourse, taskOnAnotherCourse.id, "this is an answer", true, apolloServer);


            const newContent = "this is modified content"
            const newSubmitted = false
            const modifySubmissionQuery = await apolloServer.executeOperation({query: modifySubmission, 
                variables: 
                {courseUniqueName: course.uniqueName, taskId: task.id, submissionId: submissionOnAnotherTask.id, content: newContent, submitted: newSubmitted}})
            
            expect(modifySubmissionQuery.errors[0].message).toEqual("Given submission not found")

            const courseInDB = await Course.findOne({uniqueName: course.uniqueName})
            expect(courseInDB.tasks.length).toEqual(1)
            expect(courseInDB.tasks[0].submissions.length).toEqual(1)
            expect(courseInDB.tasks[0].submissions[0].content).toEqual(wrongSubmssionOnCourse.content)    
            expect(courseInDB.tasks[0].submissions[0].submitted).toEqual(wrongSubmssionOnCourse.submitted)    

            const anotherCourseInDB = await Course.findOne({uniqueName: anotherCourse.uniqueName})
            
            expect(anotherCourseInDB.tasks.length).toEqual(1)
            expect(anotherCourseInDB.tasks[0].submissions.length).toEqual(1)
            expect(anotherCourseInDB.tasks[0].submissions[0].content).toEqual(submissionOnAnotherTask.content)    
            expect(anotherCourseInDB.tasks[0].submissions[0].submitted).toEqual(submissionOnAnotherTask.submitted)    

        })  
    })
})