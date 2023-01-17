


const CreateCourse = () =>{
    const submitCreateCourseForm = (event) => {
        event.preventDefault()
        console.log("creating a new course")
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