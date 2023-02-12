import { addCourse, setCourses, updateCourse, addStudentToCourse, removeStudentFromCourse } from "../reducers/courseReducer"
import store from '../store'



const exampleCourse = {uniqueName: "this is a unique name", name: "courses name", teacher: {username: "username", name: "users name"}, students: []}
const secondExampleCourse = {uniqueName: "this is a second unique name", name: "second courses name", teacher: {username: "second username", name: "second users name"}, students: []}

beforeEach(() => {
    store.dispatch(setCourses([]))
})


describe('course reducer tests', () => {
   
    test('addCourse reducer adds a new course to redux store', () =>{
        store.dispatch(addCourse(exampleCourse))
        const storeData = store.getState()
        expect(storeData.courses).toEqual([exampleCourse])
    })

    test('setCourses reducer sets courses to the given list', () =>{
        store.dispatch(setCourses([exampleCourse, secondExampleCourse]))
        const storeData = store.getState()
        expect(storeData.courses).toEqual([exampleCourse, secondExampleCourse])
    })

    test('updateCourse changes state of the correct course in the store courses list', () => {
        store.dispatch(setCourses([exampleCourse, secondExampleCourse]))
        const storeData = store.getState()
        expect(storeData.courses).toEqual([exampleCourse, secondExampleCourse])

        const updatedCourse = {...exampleCourse, students:[{username: "this is a new student", name: "new students name"}]}
        store.dispatch(updateCourse(updatedCourse))

        const storeDataAfterUpdate = store.getState()
        expect(storeDataAfterUpdate.courses).toEqual([updatedCourse, secondExampleCourse])
    })

    describe('courseReducer addStudentToCourse action tests', () => {
        const mockClient = {
            mutate: function(data){
                if(data.variables.courseUniqueName && data.variables.username)
                {
                    return {data: {addStudentToCourse: {uniqueName: data.variables.courseUniqueName, name: exampleCourse.name, teacher: {username: "username", name: "users name"}, students: [{username: data.variables.username}]}}}
                }
            }
        }

        const failingMockClient = {
            mutate: function(data){
                return {data: {addStudentToCourse: null}}
            }
        }
 
        test('addStudentToCourse adds new student to the store when addUserToCourse function is successfull', async () => {
            store.dispatch(setCourses([exampleCourse]))
            await store.dispatch(addStudentToCourse('this is a unique name', 'some username', mockClient))
            const storeState = store.getState()
            const courses =  storeState.courses
            expect(courses[0].students[0].username).toEqual('some username')
        })

        test('addStudentToCourse does not add new student to the store when addUserToCourse function is insuccessfull', async () => {
            store.dispatch(setCourses([exampleCourse]))
            await store.dispatch(addStudentToCourse('this is a unique name', 'some username', failingMockClient))
            const storeState = store.getState()
            const courses =  storeState.courses
            expect(courses[0].students.length).toEqual(0)
        })
       
    })
})