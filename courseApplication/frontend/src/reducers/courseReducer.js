import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import { addUserToCourse, getCourse, removeUserFromCourse, createCourse, addTaskToCourse } from "../services/courseService";
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
        },
        updateCourse(state, action){
            const updatedCourse = action.payload
           
            const updatedCourseList = state.map((course) => course.uniqueName === updatedCourse.uniqueName ? updatedCourse : course)
            return updatedCourseList
        },
        setTasks(state, action){
            const uniqueName = action.payload.uniqueName
            const newTasks = action.payload.tasks
            const courseToUpdate = state.find((course) => course.uniqueName === uniqueName)
            const updatedCourse = {...courseToUpdate, tasks: newTasks}
            const updatedCourseList = state.map((course) => course.uniqueName === uniqueName ? updatedCourse : course)
            return updatedCourseList
        }
    }
})
export const {addCourse, setCourses, updateCourse, setTasks} = courseSlice.actions


export const createNewCourse = (courseUniqueName, courseName, client) => {
    return async function (dispatch, getState){
        const createdCourse = await createCourse(courseUniqueName, courseName, "", client)
        if(createdCourse)
        {
            dispatch(addCourse(createdCourse))
            alert(`new course named ${createdCourse.name} created`)
            return true
        }
        return false
    }
}


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
export const getCoursesWithUser = (username) => {
    return function (dispatch, getState){
        const allCourses = getState().courses
        const coursesWithUserAsStudent = allCourses.filter((course) => courseHasStudent(course, username))
        return coursesWithUserAsStudent
    }
}

export const getCoursesWithTeacher = (username) => {
    return function (dispatch, getState){
        const allCourses = getState().courses
        const coursesWithUserAsStudent = allCourses.filter((course) => course.teacher.username === username)
        return coursesWithUserAsStudent
    }
}

export const createNewTaskOnCourse = (uniqueName, description, deadline, client) => {
    return async function (dispatch, getState){
        const updatedTaskList = await addTaskToCourse(uniqueName, description, deadline, client)
        if(updatedTaskList)
        {
            dispatch(setTasks({uniqueName: uniqueName, tasks:updatedTaskList}))
            const courses = getState().courses
            console.log(courses)
            return true
        }
    }
}

export default courseSlice.reducer
