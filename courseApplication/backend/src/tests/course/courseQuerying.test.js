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




describe('course querying tests', () => {
    describe('getAllCourses query tests', () => {
        test('getAllCourses returns course public data correctly', async () => {
            const user = await helpers.logIn("username")
            const courseData = {
                uniqueName: "uniqueName", 
                name: "common name", 
                teacher: "username"
            }

            const createdCourse = await helpers.makeQuery({query: createCourse, variables: {...courseData}})
            const courseInDB = createdCourse.data.createCourse
            const coursesQuery = await helpers.makeQuery({query: getAllCourses})
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
            const createdCourse = await helpers.makeQuery({query: createCourse, variables: {...courseData}})
            const courseInDB = createdCourse.data.createCourse
            
            const coursesQuery = await helpers.makeQuery({query: getAllCourses})
            expect(coursesQuery.data).toEqual(null)
            expect(coursesQuery.errors[0].message).toEqual("Unauthorized")
        })

        test('getAllCourses returns student info only from courses where the user is a student', async () => {
            const user = await helpers.logIn("username")
            const courseData = {
                uniqueName: "courses-name-where-the-user-is-a-student", 
                name: "common name", 
                teacher: "username"
            }
            const secondCourseData = {
                uniqueName: "courses-name-where-the-user-is-not-a-student", 
                name: "common name", 
                teacher: "username"
            }
            await helpers.makeQuery({query: createCourse, variables: {...courseData}})
            await helpers.makeQuery({query: createCourse, variables: {...secondCourseData}})

            //lets add the teacher as a student to both of the courses, the second student should't get this info when asking for allCourses
            await helpers.makeQuery({query: addStudentToCourse, variables: {courseUniqueName: "courses-name-where-the-user-is-a-student", addStudentToCourseUsername: "username"}})
            await helpers.makeQuery({query: addStudentToCourse, variables: {courseUniqueName: "courses-name-where-the-user-is-not-a-student", addStudentToCourseUsername: "username"}})

            const studentUser = await helpers.logIn("students username")
            await helpers.makeQuery({query: addStudentToCourse, variables: {courseUniqueName: "courses-name-where-the-user-is-a-student", addStudentToCourseUsername: studentUser.username}})

            const coursesQuery = await helpers.makeQuery({query: getAllCourses})
            const courses = coursesQuery.data.allCourses
            
            //first lets check firstCourse, there should only be the info of our student
            const returnedCourseDataWithStudent = courses.find((course) => course.uniqueName ===  "courses-name-where-the-user-is-a-student")
            expect(returnedCourseDataWithStudent.students.length).toBe(1)
            expect(returnedCourseDataWithStudent.students[0]).toEqual({username: studentUser.username, name: studentUser.name, id: studentUser._id.toString()})
            

            //second check secondCourse, there should not be any student info since the studentuser is not a student on that course
            const returnedCourseDataWithOutStudent = courses.find((course) => course.uniqueName === "courses-name-where-the-user-is-not-a-student")
            expect(returnedCourseDataWithOutStudent.students.length).toBe(0)
        })
        test('getAllCourses returns null task list', async () => {
            const user = await helpers.logIn("username")
            const courseData = {
                uniqueName: "courses-name", 
                name: "common name", 
                teacher: "username"
            }
          
            await helpers.makeQuery({query: createCourse, variables: {...courseData}})
            const createdTask = await helpers.makeQuery({query: addTaskToCourse, variables: {courseUniqueName: "courses-name", description: "this is a description for a task", deadline: new Date(Date.now()).toString()}})
            expect(createdTask.data.addTaskToCourse).toBeDefined()

            const coursesQuery = await helpers.makeQuery({query: getAllCourses})
            const courses = coursesQuery.data.allCourses
            const course = courses[0]
            expect(course.tasks).toBe(null)
        })
    })
    describe('getCourse query tests', () => {
        test('getCourseReturns all course data if queried by the teacher of the course', async () => {
            const user = await helpers.logIn("username")
            const courseData = {
                uniqueName: "courses-name", 
                name: "common name", 
                teacher: "username"
            }
            await helpers.makeQuery({query: createCourse, variables: {...courseData}})
            const createdTask = await helpers.makeQuery({query: addTaskToCourse, variables: {courseUniqueName: "courses-name", description: "this is a description for a task", deadline: new Date(Date.now()).toString()}})
            const taskID = createdTask.data.addTaskToCourse.id
            
            const submission = {
                content : "this is the answer to a task",
                submitted: true,
                taskId: taskID
            }
            await helpers.makeQuery({query: addSubmissionToCourseTask, 
                variables: {
                courseUniqueName: courseData.uniqueName, 
                taskId: submission.taskId,
                content: submission.content, 
                submitted: submission.submitted,
            }});

            const secondUser = await helpers.logIn("students username")
            await helpers.makeQuery({query: addStudentToCourse, variables: {addStudentToCourseUsername: "students username", courseUniqueName: courseData.uniqueName}})
       
            const secondSubmission = {
                content : "this is the answer to a task",
                submitted: true,
                taskId: taskID
            }
            const answer = await helpers.makeQuery({query: addSubmissionToCourseTask, 
                variables: {
                courseUniqueName: courseData.uniqueName, 
                taskId: secondSubmission.taskId,
                content: secondSubmission.content, 
                submitted: secondSubmission.submitted,
            }});
       

            await helpers.logIn("username")

            const courseInfoQuery =  await helpers.makeQuery({query: getCourse, variables: {uniqueName: "courses-name"}})
          
            const course = courseInfoQuery.data.getCourse
          
            expect(course).toBeDefined()
            expect(course.tasks.length).toBe(1)
            expect(course.tasks[0].submissions.length).toBe(2)
            expect(course.tasks[0].submissions[0].fromUser.id).toEqual(user.id)
            expect(course.tasks[0].submissions[1].fromUser.id).toEqual(secondUser.id)

        })

        test('getCourseReturns course data but with only the submissions made by the student if queried by a student', async () => {
            const user = await helpers.logIn("username")
            const courseData = {
                uniqueName: "courses-name", 
                name: "common name", 
                teacher: "username"
            }
            await helpers.makeQuery({query: createCourse, variables: {...courseData}})
            const createdTask = await helpers.makeQuery({query: addTaskToCourse, variables: {courseUniqueName: "courses-name", description: "this is a description for a task", deadline: new Date(Date.now()).toString()}})
            const taskID = createdTask.data.addTaskToCourse.id
            
            const submission = {
                content : "this is the answer to a task",
                submitted: true,
                taskId: taskID
            }
            await helpers.makeQuery({query: addSubmissionToCourseTask, 
                variables: {
                courseUniqueName: courseData.uniqueName, 
                taskId: submission.taskId,
                content: submission.content, 
                submitted: submission.submitted,
            }});

            const secondUser =  await helpers.logIn("students username")
            await helpers.makeQuery({query: addStudentToCourse, variables: {addStudentToCourseUsername: "students username", courseUniqueName: courseData.uniqueName}})
       
            const secondSubmission = {
                content : "this is the answer to a task",
                submitted: true,
                taskId: taskID
            }
            const answer = await helpers.makeQuery({query: addSubmissionToCourseTask, 
                variables: {
                courseUniqueName: courseData.uniqueName, 
                taskId: secondSubmission.taskId,
                content: secondSubmission.content, 
                submitted: secondSubmission.submitted,
            }});
         
            
            const courseInfoQuery =  await helpers.makeQuery({query: getCourse, variables: {uniqueName: "courses-name"}})
           
            const course = courseInfoQuery.data.getCourse
          
            expect(course).toBeDefined()
            expect(course.tasks.length).toBe(1)
            expect(course.tasks[0].submissions.length).toBe(1)
            expect(course.tasks[0].submissions[0].fromUser.id).toEqual(secondUser.id)
          

        })
    })
})