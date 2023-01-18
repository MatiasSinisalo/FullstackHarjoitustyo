import { addCourse } from "../reducers/courseReducer"
import { useMutation } from "@apollo/client";
import { useDispatch } from "react-redux";
import { createCourse } from "../services/courseService"
import { useApolloClient } from "@apollo/client";
const CreateCourse = () =>{
    const dispatch = useDispatch()
    const client = useApolloClient()
    const submitCreateCourseForm = async (event) => {
        event.preventDefault()
        console.log("creating a new course")
        const courseUniqueName = event.target.courseUniqueName.value
        const courseName = event.target.courseName.value
       
        const createdCourse = await createCourse(courseUniqueName, courseName, "", client)
        if(createdCourse)
        {
            dispatch(addCourse(createdCourse))
            alert(`new course named ${createdCourse.name} created`)
        }
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