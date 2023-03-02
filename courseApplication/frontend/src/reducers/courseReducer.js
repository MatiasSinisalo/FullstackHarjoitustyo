import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import { addUserToCourse, getCourse, removeUserFromCourse } from "../services/courseService";
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

export const getCourseWithUniqueName = (uniqueName, client) => {
    return async function (dispatch, getState){
        const courseInLocalStore = getState().courses.find((course) => course.uniqueName == uniqueName)
        if(courseInLocalStore)
        {
            return courseInLocalStore
        }

        const courseInDatabase = await getCourse(uniqueName, client)
        if(courseInDatabase)
        {
            dispatch(addCourse(courseInDatabase))
            return courseInDatabase
        }

        return null
    }
}



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

export const courseHasStudent = (course, studentsUsername) => {
    const hasStudent = course.students.find((user) => user.username === studentsUsername)
    return hasStudent
}

//https://redux.js.org/usage/writing-logic-thunks
export const getCoursesWithUser = (username, store) => {
    return function (dispatch, getState){
        const allCourses = getState().courses
        console.log(allCourses)
        const coursesWithUserAsStudent = allCourses.filter((course) => courseHasStudent(course, username))
        console.log(coursesWithUserAsStudent)
        return coursesWithUserAsStudent
    }
}
       

export default courseSlice.reducer
