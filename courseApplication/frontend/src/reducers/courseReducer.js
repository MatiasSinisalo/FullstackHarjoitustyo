import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import { addUserToCourse, removeUserFromCourse } from "../services/courseService";
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
        if(courseWithAddedStudent)
        {
            dispatch(updateCourse(courseWithAddedStudent))
        }
    }
}

export const removeStudentFromCourse = (courseUniqueName, username, client) => {
    return async dispatch => {
        const updatedCourse = await removeUserFromCourse(courseUniqueName, username, client)
        if(updatedCourse)
        {
            dispatch(updateCourse(updatedCourse))
        }
    }
}

const courseHasStudent = (course, studentsUsername) => {
    const hasStudent = course.students.find((user) => user.username === studentsUsername)
    return hasStudent
}

export const getCoursesWithUser = (username) => {
    return dispatch => {
        const allCourses = useSelector((store) => store.courses)
        const coursesWithUserAsStudent = allCourses.filter((course) => courseHasStudent(course, username))
        console.log(coursesWithUserAsStudent)
        return coursesWithUserAsStudent
    }
}
       

export default courseSlice.reducer
