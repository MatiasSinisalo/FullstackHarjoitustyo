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

          <label htmlFor="courseName">Courses name: </label>
          <input  placeholder="Course name" type="text" name="courseName"></input>
          <br></br>
         
          <label htmlFor="courseName">Course unique name</label>
          <p>/course/<input placeholder="Course-unique-name" type="text" name="courseUniqueName"></input>/</p>
          <input className="action-button" type="submit" value="create new course"></input>
        </form>
     </div>
     </div>
     </>
   )
 }

 export default CreateCourse