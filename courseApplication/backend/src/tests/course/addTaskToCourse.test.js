
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
const config = require('../../config')


describe('addTaskToCourse query tests', () => {
    test('addTaskToCourse creates a new task on the course with correct parameters', async () => {
        await helpers.logIn("username")
        const createdCourse = await helpers.makeQuery({query: createCourse, variables: {uniqueName: "course-owned-by-username", name: "common name", teacher: "username"}})

        const task = {
            courseUniqueName: "course-owned-by-username",
            description:  "this is the description of the course that is about testing",
            deadline: new Date("2030-06-25"),
            maxGrade: 10,
            submissions: []
        }
        
        const newTaskQuery = await helpers.makeQuery({query: addTaskToCourse, variables: {courseUniqueName: task.courseUniqueName, description: task.description, deadline: task.deadline.toString(), maxGrade: task.maxGrade}});
     
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
        expect(course.tasks[0].maxGrade).toEqual(task.maxGrade)

    })
    test('addTaskToCourse creates a new task on the course without giving maxGrade', async () => {
        await helpers.logIn("username")
        const createdCourse = await helpers.makeQuery({query: createCourse, variables: {uniqueName: "course-owned-by-username", name: "common name", teacher: "username"}})

        const task = {
            courseUniqueName: "course-owned-by-username",
            description:  "this is the description of the course that is about testing",
            deadline: new Date("2030-06-25"),
            submissions: []
        }
        
        const newTaskQuery = await helpers.makeQuery({query: addTaskToCourse, variables: {courseUniqueName: task.courseUniqueName, description: task.description, deadline: task.deadline.toString()}});
     
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
        expect(course.tasks[0].maxGrade).toEqual(undefined)

    })

    test('addTaskToCourse creates a new task on the course that already has tasks with correct parameters', async () => {
        await helpers.logIn("username", "12345")
        const createdCourse = await helpers.makeQuery({query: createCourse, variables: {uniqueName: "course-owned-by-username", name: "common name", teacher: "username"}})

        const task = {
            courseUniqueName: "course-owned-by-username",
            description:  "this is the description of the task that is about testing",
            deadline: new Date("2030-06-25"),
            submissions: []
        }
        
       await helpers.makeQuery({query: addTaskToCourse, variables: {courseUniqueName: task.courseUniqueName, description: task.description, deadline: task.deadline.toString()}});

        const secondTask = {
            courseUniqueName: "course-owned-by-username",
            description:  "this is the description of a task about debugging",
            deadline: new Date("2060-12-01"),
            submissions: []
        }
        const courseWithAddedTask = await helpers.makeQuery({query: addTaskToCourse, variables: {courseUniqueName: secondTask.courseUniqueName, description: secondTask.description, deadline: secondTask.deadline.toString()}});
        
        
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
        await helpers.logIn("username")
        const createdCourse = await helpers.makeQuery({query: createCourse, variables: {uniqueName: "course-owned-by-username", name: "common name", teacher: "username"}})

       
        const task = {
            courseUniqueName: "course-owned-by-username",
            description:  "this is the description of the course that is about testing",
            deadline: new Date("2030-06-25"),
            submissions: []
        }
        await helpers.logIn("students username")
        const response = await helpers.makeQuery({query: addTaskToCourse, variables: {courseUniqueName: task.courseUniqueName, description: task.description, deadline: task.deadline.toString()}});
        expect(response.data.addTaskToCourse).toBe(null)
        expect(response.errors[0].message).toBe("Unauthorized")
        
        const CoursesInDataBase = await Course.find({}).populate('tasks')
        expect(CoursesInDataBase.length).toBe(1)
        
        const course = CoursesInDataBase[0]

      
        expect(course.tasks).toEqual([])

    })

    test('addTaskToCourse returns Given course not found error if the course of the task does not exist', async () => {
        await helpers.logIn("username")
        const createdCourse = await helpers.makeQuery({query: createCourse, variables: {uniqueName: "course-owned-by-username", name: "common name", teacher: "username"}})

        const task = {
            courseUniqueName: "this course does not exist",
            description:  "this is the description of the course that is about testing",
            deadline: new Date("2030-06-25"),
            submissions: []
        }
        
        const response = await helpers.makeQuery({query: addTaskToCourse, variables: {courseUniqueName: task.courseUniqueName, description: task.description, deadline: task.deadline.toString()}});
     
        expect(response.data.addTaskToCourse).toBe(null)
        expect(response.errors[0].message).toBe("Given course not found")
        
        const CoursesInDataBase = await Course.find({}).populate('tasks')
        expect(CoursesInDataBase.length).toBe(1)
        
        const course = CoursesInDataBase[0]

      
        expect(course.tasks).toEqual([])

    })

    test('addTaskToCourse with empty date parameter', async () => {
        await helpers.logIn("username")
        const createdCourse = await helpers.makeQuery({query: createCourse, variables: {uniqueName: "course-owned-by-username", name: "common name", teacher: "username"}})

        const task = {
            courseUniqueName: "course-owned-by-username",
            description:  "this is the description of the course that is about testing",
            deadline: new Date("2030-06-25"),
            maxGrade: 10,
            submissions: []
        }
        
        const newTaskQuery = await helpers.makeQuery({query: addTaskToCourse, variables: {courseUniqueName: task.courseUniqueName, description: task.description, deadline: "", maxGrade: undefined}});
        expect(newTaskQuery.errors[0].message).toEqual("Incorrect date")
        console.log(newTaskQuery)
        expect(newTaskQuery.data.addTaskToCourse).toEqual(null);
        
        const CoursesInDataBase = await Course.find({}).populate('tasks')
        expect(CoursesInDataBase.length).toBe(1)
        const course = CoursesInDataBase[0]
        expect(course.tasks.length).toEqual(0);
    })

    test('addTaskToCourse with incorrect date parameter', async () => {
        await helpers.logIn("username")
        const createdCourse = await helpers.makeQuery({query: createCourse, variables: {uniqueName: "course-owned-by-username", name: "common name", teacher: "username"}})

        const task = {
            courseUniqueName: "course-owned-by-username",
            description:  "this is the description of the course that is about testing",
            deadline: new Date("2030-06-25"),
            maxGrade: 10,
            submissions: []
        }
        
        const newTaskQuery = await helpers.makeQuery({query: addTaskToCourse, variables: {courseUniqueName: task.courseUniqueName, description: task.description, deadline: "wrong date", maxGrade: undefined}});
        expect(newTaskQuery.errors[0].message).toEqual("Incorrect date")
        console.log(newTaskQuery)
        expect(newTaskQuery.data.addTaskToCourse).toEqual(null);
        
        const CoursesInDataBase = await Course.find({}).populate('tasks')
        expect(CoursesInDataBase.length).toBe(1)
        const course = CoursesInDataBase[0]
        expect(course.tasks.length).toEqual(0);
    })
})