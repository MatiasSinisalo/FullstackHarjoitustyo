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
        }
    }
})

export const addStudentToCourse = (courseUniqueName, username, client) => {
    return async dispatch => {
        const courseWithAddedStudent = await addUserToCourse(courseUniqueName, username, client)
        console.log(`join to course called with ${courseUniqueName}, ${username}`)
    }
}

export default courseSlice.reducer
export const {addCourse, setCourses} = courseSlice.actions