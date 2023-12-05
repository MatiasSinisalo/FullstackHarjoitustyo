const {Course} = require('../../models/course')
const User = require('../../models/user')
const {Task} = require('../../models/task')
const { userCreateQuery, userLogInQuery, createSpesificUserQuery } = require('../userTestQueries')
const { createMultipleChoiceTask} = require('../courseTestQueries')
const { query } = require('express')
const mongoose = require('mongoose')
const helpers = require('../testHelpers')
const config = require('../../config')


const checkCoursesNotChanged = async () => {
    const coursesInDB = await Course.find({})
    expect(coursesInDB.length).toBe(1)
    
    const courseInDB = coursesInDB[0]
    expect(courseInDB.tasks.textTasks.length).toBe(0)
    expect(courseInDB.tasks.multipleChoiceTasks.length).toBe(0)
}


describe('createMultipleChoiceTask tests', () => {
    test('createMultipleChoiceTask creates an multiple choice task to database correctly', async () => {
        const user = await helpers.logIn("username")
        const course = await helpers.createCourse("course-url-name", "courses name", [])

        const deadline = new Date("2030-06-25")
        const expectedResult = {
            description: "this is a description for multiple choice task", 
            deadline: deadline.toString(),
            questions: [],
            answers: []
        }

        const multipleChoiceTaskQuery = await helpers.makeQuery({
            query: createMultipleChoiceTask, 
            variables: {
                courseUniqueName: course.uniqueName, 
                description: expectedResult.description, 
                deadline: expectedResult.deadline
            }})
       
        
        const queryReturnObject = multipleChoiceTaskQuery.data.createMultipleChoiceTask
        const returnedDate = new Date(parseInt(queryReturnObject.deadline)).toString()
        expect(returnedDate).toEqual(expectedResult.deadline)
        expect(queryReturnObject.description).toEqual(expectedResult.description)
        expect(queryReturnObject.questions).toEqual([])
        expect(queryReturnObject.answers).toEqual([])

        const coursesInDB = await Course.find({})
        expect(coursesInDB.length).toBe(1)
        
        const courseInDB = coursesInDB[0]
        expect(courseInDB.tasks.textTasks.length).toBe(0)
        expect(courseInDB.tasks.multipleChoiceTasks.length).toBe(1)

        const multipleChoiceTaskInDB = courseInDB.tasks.multipleChoiceTasks[0]
        expect(multipleChoiceTaskInDB.deadline).toEqual(deadline)
        expect(multipleChoiceTaskInDB.description).toEqual(expectedResult.description)
        expect(multipleChoiceTaskInDB.questions).toEqual([])
        expect(multipleChoiceTaskInDB.answers).toEqual([])
    })

    test('createMultipleChoiceTask returns Unauthorized if user is not teacher', async () => {
        const user = await helpers.logIn("username")
        const course = await helpers.createCourse("course-url-name", "courses name", [])

        const secondUser = await helpers.logIn("students username")
        
        const deadline = new Date("2030-06-25")
        const expectedResult = {
            description: "this is a description for multiple choice task", 
            deadline: deadline.toString(),
            questions: [],
            answers: []
        }

        const multipleChoiceTaskQuery = await helpers.makeQuery({
            query: createMultipleChoiceTask, 
            variables: {
                courseUniqueName: course.uniqueName, 
                description: expectedResult.description, 
                deadline: expectedResult.deadline
            }})
        expect(multipleChoiceTaskQuery.errors[0].message).toEqual("Unauthorized")

        checkCoursesNotChanged()

    })

})