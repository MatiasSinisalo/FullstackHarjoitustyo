import { ADD_STUDENT_TO_COURSE, CREATE_COURSE, GET_COURSE, REMOVE_STUDENT_FROM_COURSE } from "../queries/courseQueries"
//teacher field is not currently being used on the backend at all when creating a course
export const createCourse = async (uniqueName, name, teacher, apolloClient) => {    
    try{
        const createdCourse = await apolloClient.mutate({mutation: CREATE_COURSE, variables: {uniqueName, name, teacher: ""}})
        
        if(createdCourse)
        {
            return createdCourse.data.createCourse
        }
        else{
            return null
        }
    }
    catch{
        console.log("Course Creation failed")
    }
}


export const getCourse = async (uniqueName) => {
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

