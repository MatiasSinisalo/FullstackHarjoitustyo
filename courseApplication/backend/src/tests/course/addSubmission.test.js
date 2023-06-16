

const request = require('supertest')
const Course = require('../../models/course')
const User = require('../../models/user')
const {Task} = require('../../models/task')
const { userCreateQuery, userLogInQuery, createSpesificUserQuery } = require('../userTestQueries')
const { createCourse, addTaskToCourse, removeCourse, addSubmissionToCourseTask} = require('../courseTestQueries')
const { query } = require('express')
const mongoose = require('mongoose')
const course = require('../../models/course')
const helpers = require('../testHelpers')
const config = require('../../config')



describe('addSubmissionToCourseTask tests', () => {
    test('user can create a submission to a task', async () => {
        const userQuery = await helpers.logIn("username", "12345")
        const userid = userQuery._id.toString()
        const course = {uniqueName: "course-owned-by-username", name: "common name", teacher: "username", tasks: []}
        const createdCourse = await helpers.makeQuery({query: createCourse, variables: course})
        const task = {
            description:  "this is the description of a task that is about testing",
            deadline: new Date("2030-06-25"),
            submissions: []
        }
       
        const createdTask = await helpers.makeQuery({query: addTaskToCourse, variables: {courseUniqueName: course.uniqueName, description: task.description, deadline: task.deadline.toString()}});
        const taskID = createdTask.data.addTaskToCourse.id

        const submission = {
            content : "this is the answer to a task",
            submitted: true,
            taskId: taskID
        }
        
        const response = await helpers.makeQuery({query: addSubmissionToCourseTask, 
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
        const userQuery = await helpers.logIn("username", "12345")
        const userid = userQuery._id.toString()
      
        const course = {uniqueName: "course-owned-by-username", name: "common name", teacher: "username", tasks: []}
        const createdCourse = await helpers.makeQuery({query: createCourse, variables: course})
        const task = {
            description:  "this is the description of a task that is about testing",
            deadline: new Date("2030-06-25"),
            submissions: []
        }
       
        const createdTask = await helpers.makeQuery({query: addTaskToCourse, variables: {courseUniqueName: course.uniqueName, description: task.description, deadline: task.deadline.toString()}});
        const taskID = createdTask.data.addTaskToCourse.id

        const submission = {
            content : "this is the answer to a task",
            submitted: true,
            taskId: taskID
        }
        
        const response = await helpers.makeQuery({query: addSubmissionToCourseTask, 
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
        const secondResponse = await helpers.makeQuery({query: addSubmissionToCourseTask, variables: {
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