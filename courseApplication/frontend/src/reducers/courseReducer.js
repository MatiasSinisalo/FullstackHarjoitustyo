import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import courseService from "../services/courseService";
import { Notify } from "./notificationReducer";
const courses = []



const courseSlice = createSlice({
    name: 'courses',
    initialState: courses,
    reducers: {
        addCourse(state, action) {
            return state.concat(action.payload)
        },
        setCourses(state, action){
            return action.payload
        }
    }
})
export const {addCourse, setCourses} = courseSlice.actions


export const getAllCourses = (client) => {
    return async function (dispatch, getState){
        const courses = await courseService.getAllCourses(client)
    }
}


export const createNewCourse = (courseUniqueName, courseName, client) => {
    return async function (dispatch, getState){
        const createdCourseQuery = await courseService.createCourse(courseUniqueName, courseName, "", client)
        if(!createdCourseQuery.error)
        {
            console.log(createdCourseQuery)
            dispatch(Notify(`successfully created course ${createdCourseQuery.uniqueName}`, "successNotification", 5))
            return true
        }
        else{
            dispatch(Notify(`${createdCourseQuery.error.message}`, "errorNotification", 5))
            return false
        }
      
    }
}


export const getCourseWithUniqueName = (uniqueName, client) => {
    return async function (dispatch, getState){
        const courseInDatabase = await courseService.getCourse(uniqueName, client)
    }
}



export const addStudentToCourse = (courseUniqueName, username, client) => {
    return async dispatch => {
        const courseWithAddedStudent = await courseService.addUserToCourse(courseUniqueName, username, client)
    }
}

export const removeStudentFromCourse = (courseUniqueName, username, client) => {
    return async dispatch => {
        const updatedCourse = await courseService.removeUserFromCourse(courseUniqueName, username, client)
    }
}

export const courseHasStudent = (course, studentsUsername) => {
    const hasStudent = course.students.find((user) => user.username === studentsUsername)
    return hasStudent
}

//https://redux.js.org/usage/writing-logic-thunks
 const getCoursesWithUser = (username) => {
    return function (dispatch, getState){
        const allCourses = getState().courses
        const coursesWithUserAsStudent = allCourses.filter((course) => courseHasStudent(course, username))
        return coursesWithUserAsStudent
    }
}

 const getCoursesWithTeacher = (username) => {
    return function (dispatch, getState){
        const allCourses = getState().courses
        const coursesWithUserAsStudent = allCourses.filter((course) => course.teacher.username === username)
        return coursesWithUserAsStudent
    }
}

export const createNewTaskOnCourse = (uniqueName, description, deadline, client) => {
    return async function (dispatch, getState){
        const updatedTaskList = await courseService.addTaskToCourse(uniqueName, description, deadline, client)
        if(updatedTaskList)
        {
            return true
        }
    }
}

export default courseSlice.reducer
