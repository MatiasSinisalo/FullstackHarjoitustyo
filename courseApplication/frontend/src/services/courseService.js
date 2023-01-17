import { CREATE_COURSE } from "../queries/courseQueries"
//teacher field is not currently being used on the backend at all when creating a course
export const createCourse = async (uniqueName, name, teacher, apolloClient) => {    
    const createdCourse = await apolloClient.mutate({mutation: CREATE_COURSE, variables: {uniqueName, name, teacher: ""}})
    console.log(createdCourse)
    if(createdCourse.data.createCourse)
    {
        return createdCourse.data.createCourse
    }
    else{
        return null
    }
}

