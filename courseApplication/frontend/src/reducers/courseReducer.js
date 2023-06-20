import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import courseService from "../services/courseService";
import { Notify } from "./notificationReducer";
import { useNavigate } from "react-router-dom";

const createNewCourse = (courseUniqueName, courseName, client) => {
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

 const addStudentToCourse = (courseUniqueName, username, client) => {
    return async dispatch => {
        const courseWithAddedStudent = await courseService.addUserToCourse(courseUniqueName, username, client)
    }
}

 const removeStudentFromCourse = (courseUniqueName, username, client) => {
    return async dispatch => {

        const prompt = window.prompt(`type ${username} to confirm removal`)
        if(prompt === username)
        {
            const updatedCourse = await courseService.removeUserFromCourse(courseUniqueName, username, client)
            if(!updatedCourse.error){
                dispatch(Notify("successfully removed student", "successNotification", 3))
                return true
            }
            else{
                dispatch(Notify(updatedCourse.error.message, "errorNotification", 3))
                return false
            }
        }
        else{
            dispatch(Notify("removal cancelled", "errorNotification", 3))
        }
        
    }
}

 const courseHasStudent = (course, studentsUsername) => {
    const hasStudent = course.students.find((user) => user.username === studentsUsername)
    return hasStudent
}

 const removeSubmissionFromTask = (course, task, submission, client) => {
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

 const createNewTaskOnCourse = (uniqueName, description, deadline, maxGrade, client) => {
    return async function (dispatch){
      const addedTask = await courseService.addTaskToCourse(uniqueName, description, deadline, maxGrade, client)
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

 const addSubmissionToTask = (course, task, content, client) => {
    return async function(dispatch){
        const createdSolutionQuery = await courseService.addSubmissionToCourseTask(course.uniqueName, task.id, content, false, client)
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

 const editTaskSubmission = (course, taskId, submissionId, content, submitted, client) => {
    return async function(dispatch){
        const modifiedSubmission = await courseService.modifySubmission(course.uniqueName, taskId, submissionId, content, submitted, client)
        if(!modifiedSubmission.error){
            if(submitted)
            {
                dispatch(Notify(`successfully returned task`, "successNotification", 5))
            }
            else{
                dispatch(Notify(`successfully edited task`, "successNotification", 5))
            }
            return true
        }
        else{
            dispatch(Notify(`${modifiedSubmission.error.message}`, "errorNotification", 5))
            return false
        }
    }
}

 const gradeSubmission = (courseUniqueName, taskId, submissionId, grade, client) => {
    return async function(dispatch){
        const gradedSubmission = await courseService.gradeSubmission(courseUniqueName, taskId, submissionId, grade, client) 
        if(!gradedSubmission.error){
            dispatch(Notify(`successfully graded submission`, "successNotification", 5))
            return true
        }
        else{
            dispatch(Notify(`${gradedSubmission.error.message}`, "errorNotification", 5))
            return false
        }
    }
}


 const removeTaskFromCourse = (course, task, client) => {
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

 const removeCourse = (course, client, navigate) => {
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

 const createInfoPageOnCourse = (course, pageUrl, client) => {
    return async function(dispatch)
    {
        console.log(pageUrl)
        const infoPage = await courseService.createInfoPage(course.uniqueName, pageUrl, client)
        if(!infoPage?.error)
        {
            dispatch(Notify("successfully created info page", "successNotification", 3))
            return true
        }
        else{
            dispatch(Notify(infoPage.error.message, "errorNotification", 3))
            return false
        }
    }
}

 const removeInfoPageFromCourse = (course, infoPage, client) => {
    return async function(dispatch)
    {
        const prompt = window.prompt(`type ${infoPage.locationUrl} to confirm removal`)
        if(prompt === infoPage.locationUrl)
        {
            const removed = await courseService.removeInfoPage(course.uniqueName, infoPage.id, client)
            if(!removed.error){
                dispatch(Notify(`successfully removed infoPage`, "successNotification", 5))
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

 const createContentBlockOnInfoPage = (course, pageId, content, position, client) => {
    return async function(dispatch)
    {
        const contentBlock = await courseService.createContentBlock(course.uniqueName, pageId, content, position, client)
        if(!contentBlock?.error)
        {
            dispatch(Notify("successfully created content block", "successNotification", 3))
            return true
        }
        else{
            dispatch(Notify(contentBlock.error.message, "errorNotification", 3))
            return false
        }
    }
}

 const modifyContentBlock = (course, pageId, contentBlockId, newContent, client) => {
    return async function(dispatch)
    {
        const modifiedContentBlock = await courseService.modifyContentBlock(course.uniqueName, pageId, contentBlockId, newContent, client)
        if(!modifiedContentBlock.error)
        {
            dispatch(Notify("successfully modified content block", "successNotification", 3))
            return true
        }
        else{
            dispatch(Notify(modifiedContentBlock.error.message, "errorNotification", 3))
            return false
        }
    }
}

 const removeContentBlockFromInfoPage = (course, pageId, contentBlockId, client) => {
    return async function(dispatch)
    {
        const removed = await courseService.removeContentBlock(course.uniqueName, pageId, contentBlockId, client)
        if(!removed.error)
        {
            dispatch(Notify("successfully removed content block", "successNotification", 3))
            return true
        }
        else{
            dispatch(Notify(removed.error.message, "errorNotification", 3))
            return false
        }
    }
}

const createChatRoom = (course, chatRoomName, client) => {
    return async function(dispatch)
    {
        const newChatRoom = await courseService.createChatRoom(course.uniqueName, chatRoomName, client)
        if(!newChatRoom.error)
        {
            dispatch(Notify("successfully created chat room", "successNotification", 3))
            return true
        }
        else{
            dispatch(Notify(newChatRoom.error.message, "errorNotification", 3))
            return false
        }
    }
}

const createMessage = (course, chatRoomId, content, client) => {
    return async function(dispatch)
    {
        const newMessage = await courseService.createMessage(course.uniqueName, chatRoomId, content, client)
        if(!newMessage.error)
        {
            dispatch(Notify("successfully created message", "successNotification", 3))
            return true
        }
        else{
            dispatch(Notify(newMessage.error.message, "errorNotification", 3))
            return false
        }
    }

}

const addUserToChatRoom = (course, chatRoomId, username, client) => {
    return async function(dispatch)
    {
        const addedUser = await courseService.addUserToChatRoom(course, chatRoomId, username, client)
        if(!addedUser.error)
        {
            dispatch(Notify("successfully added user", "successNotification", 3))
            return true
        }
        else{
            dispatch(Notify(addedUser.error.message, "errorNotification", 3))
            return false
        }
    }
}

export {
    createNewCourse,
    addStudentToCourse,
    removeStudentFromCourse,
    courseHasStudent,
    removeSubmissionFromTask,
    createNewTaskOnCourse,
    addSubmissionToTask,
    editTaskSubmission,
    gradeSubmission,
    removeTaskFromCourse,
    removeCourse,
    createInfoPageOnCourse,
    removeInfoPageFromCourse,
    createContentBlockOnInfoPage,
    modifyContentBlock,
    removeContentBlockFromInfoPage,
    createChatRoom,
    createMessage,
    addUserToChatRoom
}
