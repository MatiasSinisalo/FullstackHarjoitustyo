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
           
            const updatedCourseList = state.map((course) => course.uniqueName === updatedCourse.uniqueName ? updatedCourse : course)
            
            return updatedCourseList

            
        }
    }
})
export const {addCourse, setCourses, updateCourse} = courseSlice.actions

export const addStudentToCourse = (courseUniqueName, username, client) => {
    return async dispatch => {
        const courseWithAddedStudent = await addUserToCourse(courseUniqueName, username, client)
       
        dispatch(updateCourse(courseWithAddedStudent))
       
    }
}

export default courseSlice.reducer
