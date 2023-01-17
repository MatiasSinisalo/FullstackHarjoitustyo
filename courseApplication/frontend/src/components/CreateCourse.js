import { addCourse } from "../reducers/courseReducer"
import { CREATE_COURSE } from "../queries/courseQueries";
import { useMutation } from "@apollo/client";

const CreateCourse = () =>{
    const [createCourse] = useMutation(CREATE_COURSE)
    const submitCreateCourseForm = async (event) => {
        event.preventDefault()
        console.log("creating a new course")
        const courseUniqueName = event.target.courseUniqueName.value
        const courseName = event.target.courseName.value
        console.log(courseUniqueName)
        console.log(courseName)
        //teacher field is not currently being used on the backend at all when creating a course
        const createdCourse = await createCourse({variables: {uniqueName: courseUniqueName, name: courseName, teacher: ""}})
        console.log(createdCourse)
    }
    return(
     <>
     <p>Create course page</p>
     <form onSubmit={submitCreateCourseForm}>
        <p>Course unique name</p>
        <input type="text" name="courseUniqueName"></input>
        <br></br>
        <p>Course name</p>
        <input type="text" name="courseName"></input>
        <br></br>
        <input type="submit" value="submit"></input>
     </form>
     </>
 
   )
 }

 export default CreateCourse