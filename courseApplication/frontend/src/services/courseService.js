import { ADD_STUDENT_TO_COURSE, ADD_SUBMISSION_TO_COURSE, ADD_TASK_TO_COURSE, CREATE_COURSE, GET_ALL_COURSES, GET_COURSE, REMOVE_STUDENT_FROM_COURSE } from "../queries/courseQueries"
//teacher field is not currently being used on the backend at all when creating a course

export const getAllCourses = async (apolloClient) => {
    const allCourses = await apolloClient.query({query: GET_ALL_COURSES})
    return allCourses.data.allCourses
}


export const createCourse = async (uniqueName, name, teacher, apolloClient) => {    
    try{
        const createdCourse = await apolloClient.mutate({mutation: CREATE_COURSE, variables: {uniqueName, name, teacher: ""}})
        apolloClient.cache.updateQuery({query: GET_ALL_COURSES}, (data) => ({
            allCourses: data.allCourses.concat(createdCourse.data.createCourse)
        }))
        if(createdCourse)
        {
            return createdCourse.data.createCourse
        }
        else{
            return null
        }
    }
    catch(err){
        console.log(err)
        console.log("Course Creation failed")
    }
}


export const getCourse = async (uniqueName, apolloClient) => {
    const course = await apolloClient.query({query: GET_COURSE, variables: {uniqueName: uniqueName}})
    return course.data.getCourse
}

export const addUserToCourse = async (uniqueName, username, apolloClient) => {
    try{
        const courseWithAddedStudent = await apolloClient.mutate({mutation: ADD_STUDENT_TO_COURSE, variables: {courseUniqueName: uniqueName, username: username}})
       
        if(courseWithAddedStudent?.data?.addStudentToCourse)
        {
            return courseWithAddedStudent.data.addStudentToCourse
        }
        
    }
    catch(err)
    {
        console.log(err)
        return null
        
    }
}


export const removeUserFromCourse = async (uniqueName, username, apolloClient) => {
    try{
        const updatedCourse = await apolloClient.mutate({mutation: REMOVE_STUDENT_FROM_COURSE, variables: {courseUniqueName: uniqueName, username: username}})
        if(updatedCourse?.data?.removeStudentFromCourse)
        {
            return updatedCourse.data.removeStudentFromCourse
        }
    }
    catch(err)
    {
        console.log(err)
        return null
    }
   
}
//adds task to a course an returns a list of all the courses in that course
export const addTaskToCourse = async (uniqueName, description, deadline, apolloClient) => {
try{
    //add a task to a course in the database
    const result = await apolloClient.mutate({mutation: ADD_TASK_TO_COURSE, variables: {courseUniqueName: uniqueName, description: description, deadline: deadline}})
    
    if(result.data?.addTaskToCourse){
        //update course tasks in in cache to include the reference to the added task
        const course = apolloClient.readQuery({query: GET_COURSE, variables: {uniqueName: uniqueName}}).getCourse
        apolloClient.cache.modify({
            id: apolloClient.cache.identify(course),
            fields: {
                tasks(cachedTasks){
                    console.log(cachedTasks)
                    return cachedTasks.concat({__ref: `Task:${result.data.addTaskToCourse.id}`})
                }
            }
        })

        return result.data.addTaskToCourse
    }
    else{
        return null
    }
    
}
catch(err)
{
    console.log(err)
    return null
}
}


export const addSubmissionToCourseTask = async (courseUniqueName, taskId, content, submitted, client) => {
    const result = await client.mutate({mutation: ADD_SUBMISSION_TO_COURSE, variables: {courseUniqueName, taskId, content, submitted}})
    const newSubmission = result.data.addSubmissionToCourseTask
    client.cache.modify({
            id: `Task:${taskId}`,
            fields: {
                submissions(cachedSubmissions){
                    console.log(cachedSubmissions)
                    return cachedSubmissions.concat(newSubmission)
                }
            }
    })
    return result.data.addSubmissionToCourseTask
}

export default {getAllCourses, createCourse, getCourse, addUserToCourse, removeUserFromCourse, addTaskToCourse, addSubmissionToCourseTask}