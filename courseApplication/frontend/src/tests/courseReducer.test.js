import { addCourse, setCourses, updateCourse, addStudentToCourse, removeStudentFromCourse, courseHasStudent, getCoursesWithUser, getCourseWithUniqueName, setTasks } from "../reducers/courseReducer"
import store from '../store'
import { getCourse } from "../services/courseService"

//mocking partials:
//https://jestjs.io/docs/mock-functions 
jest.mock('../services/courseService', () => {
    const moduleNormal = jest.requireActual('../services/courseService')

    return{
        __esModule: true,
        ...moduleNormal,
        getCourse: jest.fn()
    }
})



const exampleCourse = {
    uniqueName: "this is a unique name", 
    name: "courses name", 
    teacher: {username: "username", name: "users name"}, 
    students: [], 
    tasks: []}
const secondExampleCourse = {
    uniqueName: "this is a second unique name", 
    name: "second courses name", 
    teacher: {username: "second username", 
    name: "second users name"}, 
    students: [], 
    tasks: []}

beforeEach(() => {
    store.dispatch(setCourses([]))
})


describe('course reducer tests', () => {
   
    test('addCourse reducer adds a new course to redux store', () =>{
        store.dispatch(addCourse(exampleCourse))
        const storeData = store.getState()
        expect(storeData.courses).toEqual([exampleCourse])
    })

    test('addCourse reducer adds a new course to redux store correctly when there are already courses', () =>{
        store.dispatch(setCourses([secondExampleCourse]))
        store.dispatch(addCourse(exampleCourse))
        const storeData = store.getState()
        expect(storeData.courses).toEqual([secondExampleCourse, exampleCourse])
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

    describe('courseReducer removeUserFromCourse action tests', () => {
        const mockClient = {
            mutate: function(data){
                if(data.variables.courseUniqueName && data.variables.username == 'some username')
                {
                    return {data: {removeStudentFromCourse: {uniqueName: data.variables.courseUniqueName, name: exampleCourse.name, teacher: {username: "username", name: "users name"}, students: []}}}
                }
            }
        }

        const failingMockClient = {
            mutate: function(data){
                return {data: {removeStudentFromCourse: null}}
            }
        }
 
        test('removeUserFromCourse removes student from the correct course from the store when removeStudentFromCourse function is successfull', async () => {
            store.dispatch(setCourses([{...exampleCourse, students: [{username: 'some username'}]}, {...secondExampleCourse, students: [{username: 'some username'}]}]))
            await store.dispatch(removeStudentFromCourse('this is a unique name', 'some username', mockClient))
            const storeState = store.getState()
            const courses =  storeState.courses
            expect(courses[0].students.length).toEqual(0)
            expect(courses[1].students.length).toEqual(1)
        })

        test('removeUserFromCourse does not change store state when removeStudentFromCourse function is not successfull', async () => {
            store.dispatch(setCourses([{...exampleCourse, students: [{username: 'some username'}]}, {...secondExampleCourse, students: [{username: 'some username'}]}]))
            await store.dispatch(removeStudentFromCourse('this is a unique name', 'some username', failingMockClient))
            const storeState = store.getState()
            const courses =  storeState.courses
            expect(courses[0].students[0].username).toEqual('some username')
            expect(courses[1].students[0].username).toEqual('some username')
        })
       
    })

    describe('courseHasStudent helper function tests', () => {
        test('courseHasStudent returns userdata stored in the course if the course has the student', () => {
            const testCourse = {...exampleCourse, students: [{username: 'some username', name: "users name"}]}
            store.dispatch(setCourses([testCourse]))
            const result = courseHasStudent(testCourse, "some username")
            expect(result).toEqual({username: "some username", name: "users name"})
        })

        test('courseHasStudent returns undefined if the course does not have the student', () => {
            const testCourse = {...exampleCourse, students: [{username: 'some username that is not the same', name: "users name"}]}
            store.dispatch(setCourses([testCourse]))
            const result = courseHasStudent(testCourse, "some username")
            expect(result).toEqual(undefined)
        })

    })


    describe('getCoursesWithUser action tests', () => {
        test('getCoursesWithUser returns correct courses if the course has the student', () => {
            const testCourse = {...exampleCourse, students: [{username: 'some username', name: "users name"}]}
            const testCourse2 =  {...secondExampleCourse, students: [{username: 'some username'}]}
            const testCourse3 =  {...secondExampleCourse, students: [{username: 'some username that is not the same'}]}
            store.dispatch(setCourses([testCourse, testCourse2, testCourse3]))
            const result = store.dispatch(getCoursesWithUser("some username", store))
            expect(result).toEqual([testCourse, testCourse2])
        })
    })

    describe('getCourseWithUniqueName action tests', () => {
        test('getCourseWithUniqueName returns correct course from local store', async () => {
            store.dispatch(setCourses([exampleCourse, secondExampleCourse]))
            const course = await store.dispatch(getCourseWithUniqueName("this is a unique name", null))
            expect(course).toEqual(exampleCourse)
            
        })

        test('getCourseWithUniqueName calls getCourse from courseService if the course is not in the local store and returns correct values if getCourse returns a course', async () => {
            store.dispatch(setCourses([secondExampleCourse]))
            getCourse.mockResolvedValue(exampleCourse)
            const course = await store.dispatch(getCourseWithUniqueName("this is a unique name", null))
            expect(course).toEqual(exampleCourse)
            
        })

        test('getCourseWithUniqueName calls getCourse from courseService if the course is not in the local store and updates store correctly if getCourse returns a course', async () => {
            store.dispatch(setCourses([secondExampleCourse]))
            getCourse.mockResolvedValue(exampleCourse)
            const course = await store.dispatch(getCourseWithUniqueName("this is a unique name", null))
            expect(course).toEqual(exampleCourse)
            expect(store.getState().courses).toEqual([secondExampleCourse, exampleCourse])
            
        })

        test('getCourseWithUniqueName calls getCourse from courseService if the course is not in the local store and returns null if getCourse returns null', async () => {
            store.dispatch(setCourses([secondExampleCourse]))
            getCourse.mockResolvedValue(null)
            const course = await store.dispatch(getCourseWithUniqueName("this is a unique name", null))
            expect(course).toEqual(null)
            
        })
    })

    describe('setTasks reducer tests', () => {
        test('setTasks sets the tasks of a course correctly', () => {
            store.dispatch(setCourses([exampleCourse, secondExampleCourse]))
            const exampleTask = {description: "this is a description of a course", deadline: Date.now()}
            store.dispatch(setTasks({uniqueName: exampleCourse.uniqueName, tasks: [exampleTask]}))
            const courses = store.getState().courses
            expect(courses[0]).toEqual({...exampleCourse, tasks: [exampleTask]})
            expect(courses[1]).toEqual(secondExampleCourse)
        })
        test('setTasks overrides the tasks of a course if the course already has tasks', () => {
            const exampleTask = {description: "this is a description of a course", deadline: Date.now()}
            store.dispatch(setCourses([{...exampleCourse, tasks: [exampleTask]}, secondExampleCourse]))
            const overrideTask = {description: "this is a description of a course that will override the tasklist", deadline: Date.now()}
            store.dispatch(setTasks({uniqueName: exampleCourse.uniqueName, tasks: [overrideTask]}))
            const courses = store.getState().courses
            expect(courses[0]).toEqual({...exampleCourse, tasks: [overrideTask]})
            expect(courses[1]).toEqual(secondExampleCourse)
        })
    })
})