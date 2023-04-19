import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import courseService from "../services/courseService";
import { Notify } from "./notificationReducer";
import { useNavigate } from "react-router-dom";

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

export const removeSubmissionFromTask = (course, task, submission, client) => {
    return async function(dispatch){
        const removed = await courseService.removeSubmissionFromCourseTask(course.uniqueName, task.id, submission.id, client)
        if(!removed.error){
            dispatch(Notify("successfully removed submission", "successNotification", 3))
            return true
        }
        else{
            dispatch(Notify(removed.error.message, "errorNotification", 3))
            return false
        }
    }
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

export const addSubmissionToTask = (course, task, content, client) => {
    return async function(dispatch){
        const createdSolutionQuery = await courseService.addSubmissionToCourseTask(course.uniqueName, task.id, content, true, client)
        if(!createdSolutionQuery.error){
            dispatch(Notify(`successfully answered to task`, "successNotification", 5))
            return true
        }
        else{
            dispatch(Notify(`${createdSolutionQuery.error.message}`, "errorNotification", 5))
            return false
        }
    }
}

export const removeTaskFromCourse = (course, task, client) => {
    return async function(dispatch){
        const removed = await courseService.removeTaskFromCourse(course.uniqueName, task.id, client);
        if(!removed.error)
        {
            dispatch(Notify("successfully removed task", "successNotification", 3))
            return true
        }
        else{
            dispatch(Notify(removed.error.message, "errorNotification", 3))
            return false
        }
    }
}

export const removeCourse = (course, client, navigate) => {
    return async function(dispatch)
    {
        const prompt = window.prompt(`type ${course.uniqueName} to confirm removal`)
        if(prompt === course.uniqueName)
        {
            console.log("removing course")
            const removed = await courseService.removeCourse(course, client)
            if(!removed.error){
                dispatch(Notify(`successfully removed course`, "successNotification", 5))
                navigate('/dashboard')
                return true
            }
            else{
                dispatch(Notify(removed.error.message, "errorNotification", 5))
                return false
            }
        }
        return false
    }
}