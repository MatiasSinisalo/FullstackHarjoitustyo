const {Course} = require('../../models/course')
const User = require('../../models/user')
const {Task} = require('../../models/task')
const { userCreateQuery, userLogInQuery, createSpesificUserQuery } = require('../userTestQueries')
const { createMultipleChoiceTask, removeMultipleChoiceTask} = require('../courseTestQueries')
const { query } = require('express')
const mongoose = require('mongoose')
const helpers = require('../testHelpers')
const config = require('../../config')



describe('removeMultipleChoiceTask tests', () => {
    test('removeMultipleChoiceTask removes multipleChoiceTask from course correctly', async() => {
        const user = await helpers.logIn("username")
        const course = await helpers.createCourse("courseUniqueName", "courses name", [])

        const deadline = new Date("2030-06-25")
        const example = {
            description: "this is a description for multiple choice task", 
            deadline: deadline.toString(),
            questions: [],
            answers: []
        }
        const createMultipleChoiceTaskQuery = await helpers.makeQuery({query: createMultipleChoiceTask, 
            variables: {courseUniqueName: course.uniqueName, description: example.description, deadline: example.deadline}})
      
        
        const removeMultipleChoiceTaskQuery = await helpers.makeQuery({
            query: removeMultipleChoiceTask,
            variables: {courseUniqueName: course.uniqueName, multipleChoiceTaskId: createMultipleChoiceTaskQuery.data.createMultipleChoiceTask.id}
        })
        
        expect(removeMultipleChoiceTaskQuery.data.removeMultipleChoiceTask).toBe(true)

        const coursesInDB = await Course.find({})
        expect(coursesInDB.length).toBe(1)

        const courseInDB = coursesInDB[0]
        expect(courseInDB.tasks.multipleChoiceTasks.length).toBe(0)
    })

})