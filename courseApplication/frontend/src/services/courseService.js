import { ADD_STUDENT_TO_COURSE, ADD_TASK_TO_COURSE, CREATE_COURSE, GET_ALL_COURSES, GET_COURSE, REMOVE_STUDENT_FROM_COURSE } from "../queries/courseQueries"
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
        apolloClient.cache.updateQuery({query: GET_ALL_COURSES}, (data) => ({
            allCourses: data.allCourses.map((course) => course.uniqueName == courseWithAddedStudent.data.addStudentToCourse.uniqueName ? courseWithAddedStudent.data.addStudentToCourse : course )
        }))
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
        apolloClient.cache.updateQuery({query: GET_ALL_COURSES}, (data) => ({
            allCourses: data.allCourses.map((course) => course.uniqueName == updatedCourse.data.removeStudentFromCourse.uniqueName ? updatedCourse.data.removeStudentFromCourse : course )
        }))
    
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
    console.log(uniqueName)
    const result = await apolloClient.mutate({mutation: ADD_TASK_TO_COURSE, variables: {courseUniqueName: uniqueName, description: description, deadline: deadline}})
    if(result?.data?.addTaskToCourse){
        return result?.data?.addTaskToCourse.tasks
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

export default {getAllCourses, createCourse, getCourse, addUserToCourse, removeUserFromCourse, addTaskToCourse}