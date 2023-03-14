import { createCourse, addUserToCourse, removeUserFromCourse, getCourse } from '../services/courseService'

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
            const createdCourse = await createCourse('', '', '', mockClient)
            expect(createdCourse).toEqual(null)
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
})