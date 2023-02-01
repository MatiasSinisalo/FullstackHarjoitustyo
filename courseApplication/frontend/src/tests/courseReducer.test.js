import { addCourse, setCourses, updateCourse } from "../reducers/courseReducer";
import store from '../store'
const exampleCourse = {uniqueName: "this is a unique name", name: "courses name", teacher: {username: "username", name: "users name"}}
const secondExampleCourse = {uniqueName: "this is a second unique name", name: "second courses name", teacher: {username: "second username", name: "second users name"}}

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
})