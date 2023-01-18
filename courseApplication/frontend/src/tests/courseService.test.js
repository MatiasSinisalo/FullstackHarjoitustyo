import { createCourse } from '../services/courseService'
import {createMockClient} from '@apollo/client/testing'


const mockClient = {
    mutate : (data) => {
        if(data.variables.uniqueName && data.variables.name)
        return {data: {createCourse: {uniqueName: data.variables.uniqueName, name: data.variables.name, teacher: {username: "username", name: "users name"}}}}
    },
}
describe('courseService tests', () => {
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