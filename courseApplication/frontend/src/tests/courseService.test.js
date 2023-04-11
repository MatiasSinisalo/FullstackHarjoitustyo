import { ADD_SUBMISSION_TO_COURSE, ADD_TASK_TO_COURSE, REMOVE_COURSE, REMOVE_TASK_FROM_COURSE } from '../queries/courseQueries'
import courseService, { createCourse, addUserToCourse, removeUserFromCourse, getCourse, addTaskToCourse, addSubmissionToCourseTask, removeTaskFromCourse } from '../services/courseService'

const mockClient = jest.mock
mockClient.cache = jest.mock()
mockClient.cache.updateQuery = jest.fn()



describe('courseService tests', () => {
    describe('createCourse function tests', () => {
        const data = {
            createCourse: {uniqueName: 'unique name', name: 'name'}
        }
       
        test('createCourse function calls backend correctly and returns correct parameters', async () => {
            mockClient.mutate = jest.fn(() => {return {data}})
            const createdCourse = await createCourse('unique name', 'name', '', mockClient)
            expect(mockClient.mutate.mock.calls).toHaveLength(1);
            
            const variables = mockClient.mutate.mock.calls[0][0].variables
            expect(variables.uniqueName).toEqual('unique name');
            expect(variables.name).toEqual('name')
            
            expect(createdCourse.uniqueName).toEqual('unique name');
            expect(createdCourse.name).toEqual('name')

        })
        test('createCourse function returns correctly with incorrect parameters', async () => {
            mockClient.mutate = jest.fn(() => {throw new Error("this is some kind of an error")})
            const createdCourse = await createCourse('', '', '', mockClient)
            expect(createdCourse.error.message).toEqual("this is some kind of an error")
        })
    })
    describe('removeCourse function Tests', () => {
        const course = {
            id: "abc1234",
            uniqueName: "courses unique name",
            name: "courses name",
        }
        test('removeCourse calls backend with correct data', async () => {
            mockClient.mutate = jest.fn(() => {return {data: {removeCourse: true}}})
            mockClient.cache.identify = jest.fn(() => {return `Course:${course.id}`})
            mockClient.cache.evict = jest.fn()
            
            const courseRemoved = await courseService.removeCourse(course, mockClient)
            
            expect(mockClient.mutate.mock.calls[0][0].variables).toEqual({uniqueName: course.uniqueName})
            expect(mockClient.mutate.mock.calls[0][0].mutation).toEqual(REMOVE_COURSE)
        })

        test('removeCourse calls cache clear functions correctly', async () => {
            mockClient.mutate = jest.fn(() => {return {data: {removeCourse: true}}})
            mockClient.cache.identify = jest.fn(() => {return `Course:${course.id}`})
            mockClient.cache.evict = jest.fn(() => {return true})
            mockClient.cache.gc = jest.fn(() => {return true})

            const courseRemoved = await courseService.removeCourse(course, mockClient)
           
            expect( mockClient.cache.identify.mock.calls[0][0]).toEqual(course)
            expect( mockClient.cache.evict.mock.calls[0][0]).toEqual({id: `Course:${course.id}`})
            expect( mockClient.cache.gc).toHaveBeenCalled()
        })
    })
    describe('addUserToCourse function test', () => {
        const data = {
            addStudentToCourse: {uniqueName: 'courses unique name', students: [{username: 'users username', name: 'users name 4321'}]}
        }
        test('addUserToCourse calls backend with correct data and returns correctly', async () => {
            mockClient.mutate = jest.fn(() => {return {data}})
            const correctCourse = data.addStudentToCourse
            const courseWithAddedStudent = await addUserToCourse(correctCourse.uniqueName, correctCourse.students[0].username, mockClient)
           
            const variables = mockClient.mutate.mock.calls[0][0].variables
            expect(variables.courseUniqueName).toEqual(correctCourse.uniqueName)
            expect(variables.username).toEqual(correctCourse.students[0].username)

            expect(courseWithAddedStudent.uniqueName).toEqual(correctCourse.uniqueName)
            expect(courseWithAddedStudent.students[0].name).toEqual(correctCourse.students[0].name)
            expect(courseWithAddedStudent.students[0].username).toEqual(correctCourse.students[0].username)
        }) 
    })

    describe('removeUserFromCourse function test', () => {
        const data = {
            removeStudentFromCourse: {uniqueName: 'courses unique name', students: [{username: 'users username', name: 'users name 4321'}]}
        }
        test('removeUserFromCourse calls backend with correct data', async () => {
            mockClient.mutate = jest.fn(() => {return {data}})
            const correctCourse = data.removeStudentFromCourse
            const courseWithAddedStudent = await removeUserFromCourse(correctCourse.uniqueName, correctCourse.students[0].username, mockClient)
           
            const variables = mockClient.mutate.mock.calls[0][0].variables
            expect(variables.courseUniqueName).toEqual(correctCourse.uniqueName)
            expect(variables.username).toEqual(correctCourse.students[0].username)
           
            expect(courseWithAddedStudent.uniqueName).toEqual(correctCourse.uniqueName)
            expect(courseWithAddedStudent.students[0].name).toEqual(correctCourse.students[0].name)
            expect(courseWithAddedStudent.students[0].username).toEqual(correctCourse.students[0].username)
        }) 
    })

    describe('getCourse tests', ()=> {
        const exampleCourse = {
            uniqueName: "this is an example course", 
            name: "name of the course", 
            students: [], 
            tasks: [], 
            teacher: {username: "teachers username", name: "teachers name"}
        }
        
        const data = {
            getCourse: exampleCourse
        }
        
        test('getCourse calls backend correctly and returns correct info', async () => {
            mockClient.query = jest.fn(() => {return {data}})
            const result = await getCourse(exampleCourse.uniqueName, mockClient)
            
            const variables = mockClient.query.mock.calls[0][0].variables
            expect(variables.uniqueName).toEqual(exampleCourse.uniqueName)

            expect(result).toEqual(exampleCourse)
        })
 
        test('getCourse returns null if backend does not have the correct course', async () => {
            mockClient.query = jest.fn(() => {return {data: {getCourse: null}}})
            const result = await getCourse("this is an example course", mockClient)
            expect(result).toEqual(null)
        })
    })

    describe('addTaskToCourse Tests', () => {
        test('addTaskToCourse calls backend with correct data and returns correctly', async () => {
            const task = {
                description: "description of a task",
                deadline: new Date(Date.now() + 1),
                submissions: [],
            }
            
            mockClient.mutate = jest.fn(() => {return {data: {addTaskToCourse: task}}})
            mockClient.readQuery = jest.fn(() => {return {getCourse: {uniqueName: "test"}}})
            mockClient.cache.modify = jest.fn((x) => {return x})
            mockClient.cache.identify = jest.fn()
            
            const result = await addTaskToCourse("course", task.description, task.deadline, mockClient)
            expect(result).toEqual(task)
            
            const mutation = mockClient.mutate.mock.calls[0][0].mutation
            expect(mutation).toEqual(ADD_TASK_TO_COURSE)

            const variables = mockClient.mutate.mock.calls[0][0].variables
            expect(variables).toEqual({courseUniqueName: "course", description: task.description, deadline: task.deadline})

            const cacheUpdateArgs = mockClient.cache.modify.mock.calls[0][0]
            expect(mockClient.cache.modify).toHaveBeenCalled()

        })
    })

    describe('addSubmissionToCourseTask Tests', () => {
        test('addSubmissionToCourseTask calls backend with correct data and returns correctly', async () => {
            const task = {
                id: "abc1234"
            }
            
            const submission = {
                content: "content of a answer",
                submitted: true,
                fromUser: {
                    username: "username",
                    name: "name",
                    id: "1234abc"
                }
            }
            
            mockClient.mutate = jest.fn(() => {return {data: {addSubmissionToCourseTask: submission}}})
            mockClient.readQuery = jest.fn(() => {return {getCourse: {uniqueName: "test"}}})
            mockClient.cache.modify = jest.fn((x) => {return x})
            mockClient.cache.identify = jest.fn()
            
            const result = await addSubmissionToCourseTask("course", task.id, submission.content, submission.submitted, mockClient)
            expect(result).toEqual(submission)
            
            const mutation = mockClient.mutate.mock.calls[0][0].mutation
            expect(mutation).toEqual(ADD_SUBMISSION_TO_COURSE)

            const variables = mockClient.mutate.mock.calls[0][0].variables
            expect(variables).toEqual({courseUniqueName: "course", taskId: task.id, content: submission.content, submitted: submission.submitted})

            const cacheUpdateArgs = mockClient.cache.modify.mock.calls[0][0]
            expect(mockClient.cache.modify).toHaveBeenCalled()

        })
    })

    describe('removeTaskFromCourseTests', () => {
        test('removeTaskFromCourse calls backend with correct data', async () => {
            mockClient.mutate = jest.fn(() => {return {data: {removeTaskFromCourse: true}}})
            mockClient.cache.gc = jest.fn()
            mockClient.cache.evict = jest.fn((x) => {return x})
            mockClient.cache.identify = jest.fn()

            const result = await removeTaskFromCourse("coursename", "abc1234", mockClient)
            expect(result).toBe(true)
            
            const mutation = mockClient.mutate.mock.calls[0][0].mutation
            expect(mutation).toEqual(REMOVE_TASK_FROM_COURSE)

            const variables = mockClient.mutate.mock.calls[0][0].variables
            expect(variables).toEqual({courseUniqueName: "coursename", taskId: "abc1234"})

            const cacheClearVariables = mockClient.cache.evict.mock.calls[0][0]
            expect(cacheClearVariables).toEqual({id: "Task:abc1234"})

            expect(mockClient.cache.gc).toHaveBeenCalled()

        })

        test('removeTaskFromCourse returns error correctly', async () => {
            mockClient.mutate = jest.fn(() => {throw new Error("this is some kind of error")})
            const result = await removeTaskFromCourse("coursename", "abc1234", mockClient)
            expect(result.error.message).toEqual("this is some kind of error")
        })


    })
})