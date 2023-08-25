const {Course} = require('../../models/course')
const User = require('../../models/user')
const {Task} = require('../../models/task')
const { userCreateQuery, userLogInQuery, createSpesificUserQuery } = require('../userTestQueries')
const { createMultipleChoiceTask} = require('../courseTestQueries')
const { query } = require('express')
const mongoose = require('mongoose')
const helpers = require('../testHelpers')
const config = require('../../config')


describe('createMultipleChoiceTask tests', () => {
    test('createMultipleChoiceTask creates an multiple choice task to database correctly', async () => {
        const user = await helpers.logIn("username")
        const course = await helpers.createCourse("course-url-name", "courses name", [])
        const multipleChoiceTask = await helpers.makeQuery({
            query: createMultipleChoiceTask, 
            variables: {
                courseUniqueName: course.uniqueName, 
                description: "this is a description for multiple choice task", 
                deadline: new Date("2030-06-25").toString()
            }})
        console.log(multipleChoiceTask)
        expect(multipleChoiceTask.createMultipleChoiceTask?.data).toBeDefined()
    })
})