import { createCourse, addUserToCourse, removeUserFromCourse, getCourse } from '../services/courseService'
import {createMockClient} from '@apollo/client/testing'



describe('courseService tests', () => {
    const mockClient = {
        mutate : (data) => {
            if(data.variables.uniqueName && data.variables.name)
            {
                return {data: {createCourse: {uniqueName: data.variables.uniqueName, name: data.variables.name, teacher: {username: "username", name: "users name"}}}}
            }
        },
    }
    describe('createCourse function tests', () => {
        test('createCourse function returns correctly with correct parameters', async () => {
            const createdCourse = await createCourse('unique name', 'name', '', mockClient)
            expect(createdCourse.uniqueName).toEqual('unique name')
            expect(createdCourse.name).toEqual('name')
    
    
            const secondCreatedCourse = await createCourse('another unique name', 'second name', '', mockClient)
            expect(secondCreatedCourse.uniqueName).toEqual('another unique name')
            expect(secondCreatedCourse.name).toEqual('second name')
        })
        test('createCourse function returns correctly with incorrect parameters', async () => {
            const createdCourse = await createCourse('', '', '', mockClient)
            expect(createdCourse).toEqual(null)
        })
    })

    describe('addUserToCourse function test', () => {
        const mockClient = {
            mutate : (data) => {
                if(data.variables.courseUniqueName && data.variables.username)
                {
                    return {data: {addStudentToCourse: {uniqueName: data.variables.courseUniqueName, name: 'course name', students : [{username: data.variables.username, name: 'users name 4321'}], teacher: {username: "username", name: "users name"}}}}
                }
            },
        }
        test('addUserToCourse calls backend with correct data', async () => {
            const courseWithAddedStudent = await addUserToCourse('courses unique name', 'users username', mockClient)
            expect(courseWithAddedStudent.uniqueName).toEqual('courses unique name')
            expect(courseWithAddedStudent.students[0].name).toEqual('users name 4321')
            expect(courseWithAddedStudent.students[0].username).toEqual('users username')
        }) 
    })

    describe('removeUserFromCourse function test', () => {
        const mockClient = {
            mutate : (data) => {
                if(data.variables.courseUniqueName && data.variables.username)
                {
                    return {data: {removeStudentFromCourse: {uniqueName: data.variables.courseUniqueName, name: 'course name', students : [{username: data.variables.username, name: 'users name 4321'}], teacher: {username: "username", name: "users name"}}}}
                }
            },
        }
        test('removeUserFromCourse calls backend with correct data', async () => {
            const courseWithAddedStudent = await removeUserFromCourse('courses unique name', 'students username to be removed', mockClient)
            expect(courseWithAddedStudent.uniqueName).toEqual('courses unique name')
            expect(courseWithAddedStudent.students[0].name).toEqual('users name 4321')
            expect(courseWithAddedStudent.students[0].username).toEqual('students username to be removed')
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
        const mockClientWithCorrectCourse = {
            query: (data) => {
                if(data.variables.uniqueName === "this is an example course")
                {
                    return {data: {getCourse: exampleCourse}}
                }
                else{
                    return undefined
                }
            }
        }

        const mockClientWithoutCorrectCourse = {
            query: (data) => {
                if(data.variables.uniqueName === "this is an example course")
                {
                    return {data: {getCourse: null}}
                }
                else{
                    return undefined
                }
            }
        }

        test('getCourse calls backend correctly and returns correct info', async () => {
            const result = await getCourse("this is an example course", mockClientWithCorrectCourse)
            expect(result).toEqual(exampleCourse)
        })

        
        test('getCourse returns null if backend does not have the correct course', async () => {
            const result = await getCourse("this is an example course", mockClientWithoutCorrectCourse)
            expect(result).toEqual(null)
        })
    })
})