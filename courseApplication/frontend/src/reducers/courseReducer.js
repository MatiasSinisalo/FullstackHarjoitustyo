import { createSlice } from "@reduxjs/toolkit";
import { addUserToCourse } from "../services/courseService";
const courses = []



const courseSlice = createSlice({
    name: 'courses',
    initialState: courses,
    reducers: {
        addCourse(state, action) {
            return courses.concat(action.payload)
        },
        setCourses(state, action){
            return action.payload
        },
        updateCourse(state, action){
            const updatedCourse = action.payload
            console.log(`updating local store course list`)
            console.log(updatedCourse)

            const updatedCourseList = state.map((course) => course.uniqueName === updatedCourse.uniqueName ? updatedCourse : course)
            console.log("updated local course list")
            console.log(updatedCourseList)
            return updatedCourseList

            
        }
    }
})
export const {addCourse, setCourses, updateCourse} = courseSlice.actions

export const addStudentToCourse = (courseUniqueName, username, client) => {
    return async dispatch => {
        const courseWithAddedStudent = await addUserToCourse(courseUniqueName, username, client)
        console.log(courseWithAddedStudent)
        dispatch(updateCourse(courseWithAddedStudent))
        console.log(`join to course called with ${courseUniqueName}, ${username}`)
    }
}

export default courseSlice.reducer
