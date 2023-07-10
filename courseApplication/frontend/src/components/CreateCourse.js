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
        await createNewCourse(courseUniqueName, courseName, client)
     
    }
    return(
    <>
    
    <div className="container">
    
    <div className="container ">
      <h1>Create course page</h1>
      <form className="app-form container primary" onSubmit={submitCreateCourseForm}>
          <input placeholder="Course unique name" type="text" name="courseUniqueName"></input>
          <br></br>
          <input  placeholder="Course name" type="text" name="courseName"></input>
          <br></br>
          <input type="submit" value="submit"></input>
      </form>
     </div>
     </div>
     </>
   )
 }

 export default CreateCourse