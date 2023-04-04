import { createNewCourse } from "../reducers/courseReducer"
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
        await dispatch(createNewCourse(courseUniqueName, courseName, client))
     
    }
    return(
    <>
    <h1>Create course page</h1>
    <div class="blueBox">
   
     <form onSubmit={submitCreateCourseForm}>
      
        <input placeholder="Course unique name" type="text" name="courseUniqueName"></input>
        <br></br>
        <input  placeholder="Course name" type="text" name="courseName"></input>
        <br></br>
        <input type="submit" value="submit"></input>
     </form>
     </div>
     </>
   )
 }

 export default CreateCourse