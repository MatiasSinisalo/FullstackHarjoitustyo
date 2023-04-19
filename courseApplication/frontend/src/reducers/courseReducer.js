import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import courseService from "../services/courseService";
import { Notify } from "./notificationReducer";

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

export const createNewTaskOnCourse = (uniqueName, description, deadline, client) => {
    return async function (dispatch){
      const addedTask = await courseService.addTaskToCourse(uniqueName, description, deadline, client)
      if(!addedTask.error){
        dispatch(Notify(`successfully created task`, "successNotification", 5))
        return true
      }
      else{
        dispatch(Notify(`${addedTask.error.message}`, "errorNotification", 5))
        return false
      }
    }
}

