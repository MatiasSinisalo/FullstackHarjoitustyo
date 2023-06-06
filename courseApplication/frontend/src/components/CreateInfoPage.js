import { useState } from "react"



const CreateInfoPage = () => {
   
    const createInfoPage = (event) => {
        event.preventDefault()
    }
    return(
       <div>
       <form onSubmit={createInfoPage}>
        <label htmlFor="locationUrl">page location: </label>
        <input type="text" name="locationUrl"></input>
        <input type="submit" value="create new info page"></input>
       </form>
       </div>
      
    )
}


export default CreateInfoPage