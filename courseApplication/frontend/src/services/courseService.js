import { ADD_CONTENT_BLOCK_TO_INFO_PAGE, ADD_INFO_PAGE_TO_COURSE, ADD_STUDENT_TO_COURSE, ADD_SUBMISSION_TO_COURSE, ADD_TASK_TO_COURSE, ADD_USER_TO_CHAT_ROOM, CREATE_CHAT_ROOM, CREATE_COURSE, CREATE_MESSAGE, GET_ALL_COURSES, GET_COURSE, GRADE_SUBMISSION, MODIFY_CONTENT_BLOCK, MODIFY_SUBMISSION, REMOVE_CHAT_ROOM, REMOVE_CONTENT_BLOCK_FROM_INFO_PAGE, REMOVE_COURSE, REMOVE_INFO_PAGE_FROM_COURSE, REMOVE_STUDENT_FROM_COURSE, REMOVE_SUBMISSION_FROM_COURSE_TASK, REMOVE_TASK_FROM_COURSE, REMOVE_USER_FROM_CHAT_ROOM } from "../queries/courseQueries"
import { ME } from "../queries/userQueries"
import apolloCache from "../caching/apolloCache"
export const getAllCourses = async (apolloClient) => {
    const allCourses = await apolloClient.query({query: GET_ALL_COURSES})
    return allCourses.data.allCourses
}


export const createCourse = async (uniqueName, name, apolloClient) => {    
    try{
        const createdCourse = await apolloClient.mutate({mutation: CREATE_COURSE, variables: {uniqueName, name}})
        const course = createdCourse.data?.createCourse
        if(course)
        {
            apolloCache.addTeachesCourseRefToUser(apolloClient, course)
            return course
        }
    }
    catch(err){
        return {error: err}
    }
}

export const removeCourse = async(course, apolloClient)=>{
    try{
      const removed = await apolloClient.mutate({mutation: REMOVE_COURSE, variables: {uniqueName: course.uniqueName}})

      if(removed.data.removeCourse){
        apolloCache.freeCourseFromCache(apolloClient, course)
      }
      return removed.data.removeCourse
    }
    catch(err){
        return {error: err}
    }
}


export const getCourse = async (uniqueName, apolloClient) => {
    const course = await apolloClient.query({query: GET_COURSE, variables: {uniqueName: uniqueName}})
    return course.data.getCourse
}



export const addUserToCourse = async (uniqueName, username, apolloClient) => {
    try{
        const courseWithAddedStudent = await apolloClient.mutate({mutation: ADD_STUDENT_TO_COURSE, variables: {courseUniqueName: uniqueName, username: username}})
        const course = courseWithAddedStudent?.data?.addStudentToCourse
        if(course)
        {
            apolloCache.addUserToUserAttendsListCache(username, course, apolloClient)
            return courseWithAddedStudent.data.addStudentToCourse
        }
        
    }
    catch(err)
    {
        console.log(err)
        return {error: err}
        
    }
}


export const removeUserFromCourse = async (uniqueName, username, apolloClient) => {
    try{
        const updatedCourse = await apolloClient.mutate({mutation: REMOVE_STUDENT_FROM_COURSE, variables: {courseUniqueName: uniqueName, username: username}})
        const course = updatedCourse?.data?.removeStudentFromCourse
        if(course)
        {
            apolloCache.removeCourseFromUserAttendsListCache(uniqueName, username, apolloClient)
            return updatedCourse.data.removeStudentFromCourse
        }
    }
    catch(err)
    {
        console.log(err)
        return {error: err}
    }
   
}
//adds task to a course an returns a list of all the courses in that course
export const addTaskToCourse = async (uniqueName, description, deadline, maxGrade, apolloClient) => {
try{
    //add a task to a course in the database
    const result = await apolloClient.mutate({mutation: ADD_TASK_TO_COURSE, variables: {courseUniqueName: uniqueName, description: description, deadline: deadline, maxGrade: maxGrade}})
    
    if(result.data?.addTaskToCourse){
       
        apolloCache.addTaskToCourseCache(apolloClient, uniqueName, result)

        return result.data.addTaskToCourse
    }
    else{
        return null
    }
    
}
catch(err)
{
    console.log(err)
    return {error: err}
}
}


export const addSubmissionToCourseTask = async (courseUniqueName, taskId, content, submitted, client) => {
    try{
    const result = await client.mutate({mutation: ADD_SUBMISSION_TO_COURSE, variables: {courseUniqueName, taskId, content, submitted}})
    const newSubmission = result.data.addSubmissionToCourseTask
    if(newSubmission)
    {
        apolloCache.addSubmissionToCourseTaskCache(client, taskId, newSubmission)
        return newSubmission
    }
    }
    catch(err){
        return {error: err}
    }
}

export const removeTaskFromCourse = async (courseUniqueName, taskId, client) => {
    try{
        const result = await client.mutate({mutation: REMOVE_TASK_FROM_COURSE, variables: {courseUniqueName, taskId}})
        if(result.data.removeTaskFromCourse){
            apolloCache.freeTaskFromCache(client, taskId)
            return true
        }
    }
    catch(err)
    {
        return {error: err}
    }
}

export const removeSubmissionFromCourseTask = async (courseUniqueName, taskId, submissionId, client) => {
    try{
        const result = await client.mutate({mutation: REMOVE_SUBMISSION_FROM_COURSE_TASK, variables: {courseUniqueName, taskId, submissionId}})
        if(result.data.removeSubmissionFromCourseTask)
        {
            apolloCache.freeSubmissionFromCache(client, submissionId)
            return result.data.removeSubmissionFromCourseTask
        }
    }
    catch(err)
    {
        return {error: err}
    }
} 

const modifySubmission = async (courseUniqueName, taskId, submissionId, content, submitted, client) => {
    try{
        const result = await client.mutate({mutation: MODIFY_SUBMISSION, variables: {courseUniqueName, taskId, submissionId, content, submitted}})
        if(result.data.modifySubmission)
        {
            return result.data.modifySubmission
        }
    }
    catch(err)
    {
        return {error: err}
    }
}

const gradeSubmission = async (courseUniqueName, taskId, submissionId, grade, client) => {
    try{
        const result = await client.mutate({mutation: GRADE_SUBMISSION, variables: {courseUniqueName, taskId, submissionId, points: grade}})
        if(result.data.gradeSubmission)
        {
            return result.data.gradeSubmission
        }
    }
    catch(err)
    {
        return {error: err}
    }
}

const createInfoPage = async (courseUniqueName, locationUrl, client) => {
    try{
        const result = await client.mutate({mutation: ADD_INFO_PAGE_TO_COURSE, variables: {courseUniqueName, locationUrl}})
        if(result.data.addInfoPageToCourse)
        {
            apolloCache.addInfoPageRefToCourseCache(client, courseUniqueName, result)
            return result.data.addInfoPageToCourse
        }
    }
    catch(err)
    {
        return {error: err}
    }
} 

const removeInfoPage = async (courseUniqueName, infoPageId, client) => {
    try{
        const result = await client.mutate({
            mutation: REMOVE_INFO_PAGE_FROM_COURSE, variables: {courseUniqueName, infoPageId},
        })
        if(result.data.removeInfoPageFromCourse)
        {
            apolloCache.freeInfoPageFromCache(client, infoPageId)
            return result.data.removeInfoPageFromCourse
        }
    }
    catch(err)
    {
        return {error: err}
    }

}

const createContentBlock = async (courseUniqueName, pageId, content, position, client) => {
    try{
        const result = await client.mutate({
            mutation: ADD_CONTENT_BLOCK_TO_INFO_PAGE, variables: {courseUniqueName, infoPageId: pageId, content, position},
        })
        if(result.data.addContentBlockToInfoPage)
        {
            apolloCache.addContentBlockToInfoPageCache(result, client, pageId)
            return result.data.addContentBlockToInfoPage
        }
    }
    catch(err)
    {
        return {error: err}
    }
}

const modifyContentBlock = async (courseUniqueName, pageId, contentBlockId, newContent, client)=> {
    try{
        const result = await client.mutate({
            mutation: MODIFY_CONTENT_BLOCK, variables: {courseUniqueName, infoPageId: pageId, contentBlockId: contentBlockId, content: newContent},
        })
        if(result.data.modifyContentBlock)
        {
           
            return result.data.modifyContentBlock
        }
    }
    catch(err)
    {
        return {error: err}
    }
}

const removeContentBlock = async(courseUniqueName, pageId, contentBlockId, client) => {
    try{
        const result = await client.mutate({
            mutation: REMOVE_CONTENT_BLOCK_FROM_INFO_PAGE, variables: {courseUniqueName, infoPageId: pageId, contentBlockId},
        })
        if(result.data.removeContentBlockFromInfoPage)
        {
            apolloCache.freeContentBlockFromCache(client, contentBlockId)
            return result.data.removeContentBlockFromInfoPage
        }
    }
    catch(err)
    {
        return {error: err}
    }
}

const createChatRoom = async (courseUniqueName, chatRoomName, client) => {
    try{
        const result = await client.mutate({mutation: CREATE_CHAT_ROOM, variables: {courseUniqueName, name: chatRoomName}})
        if(result.data.createChatRoom)
        {
            apolloCache.addChatRoomRefToCourseCache(client, courseUniqueName, result)
            return result.data.createChatRoom
        }
    }
    catch(err){
        return {error: err}
    }
}

const removeChatRoom = async (courseUniqueName, chatRoomId, client) => {
    try{
        const result = await client.mutate({mutation: REMOVE_CHAT_ROOM, variables: {courseUniqueName, chatRoomId}})
        if(result.data.removeChatRoom)
        {
            
            apolloCache.freeChatRoomFromCache(client, chatRoomId)
            return result.data.removeChatRoom
        }
    }
    catch(err){
        return {error: err}
    }
}

const createMessage = async(courseUniqueName, chatRoomId, content, client) => {
    try{
        const result = await client.mutate({mutation: CREATE_MESSAGE, variables: {courseUniqueName, chatRoomId: chatRoomId, content: content}})
        if(result.data.createMessage)
        {
            const message = result.data.createMessage
            apolloCache.addMessageRefToChatRoomCache(client, chatRoomId, message)
            return message
        }
    }
    catch(err)
    {
        return {error: err}
    }
}


const addUserToChatRoom = async (course, chatRoomId, username, client) => {
    try{
        const result = await client.mutate({mutation: ADD_USER_TO_CHAT_ROOM, variables: {courseUniqueName: course.uniqueName, chatRoomId: chatRoomId, username: username}})
        if(result.data.addUserToChatRoom)
        {
            const user = result.data.addUserToChatRoom
            apolloCache.addUserRefToChatRoomCache(client, chatRoomId, user)
            return user
        }
    }
    catch(err)
    {
        return {error: err}
    }
}

const removeUserFromChatRoom = async (course, chatRoomId, userToRemove, client) => {
    try{
        const result = await client.mutate({mutation: REMOVE_USER_FROM_CHAT_ROOM, 
            variables: {courseUniqueName: course.uniqueName, chatRoomId: chatRoomId, username: userToRemove.username}})
        
        if(result.data.removeUserFromChatRoom){
            const removed = result.data.removeUserFromChatRoom
            apolloCache.removeUserRefFromChatRoomCache(client, chatRoomId, userToRemove)
            return removed
        }
    }
    catch(err)
    {
        return {error: err}
    }
}

export default {getAllCourses, 
    createCourse, 
    removeCourse, 
    getCourse, 
    addUserToCourse, 
    removeUserFromCourse, 
    addTaskToCourse, 
    addSubmissionToCourseTask, 
    removeTaskFromCourse,
    removeSubmissionFromCourseTask,
    modifySubmission,
    gradeSubmission,
    createInfoPage,
    removeInfoPage,
    createContentBlock,
    modifyContentBlock,
    removeContentBlock,
    createChatRoom,
    createMessage,
    addUserToChatRoom,
    removeUserFromChatRoom,
    removeChatRoom
}


