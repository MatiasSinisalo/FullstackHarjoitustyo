import { useApolloClient } from "@apollo/client"
import { useState } from "react"
import { useDispatch } from "react-redux"
import { createInfoPageOnCourse } from "../../reducers/courseReducer"



const CreateInfoPage = ({course}) => {
    const dispatch = useDispatch()
    const client = useApolloClient()
    const createInfoPage = async (event) => {
        event.preventDefault()
        const pageUrl = event.target.locationUrl.value
        await createInfoPageOnCourse(course, pageUrl, client)
    }
    return(
       <div>
        <h3>create new info page</h3>
        <form onSubmit={createInfoPage}>
            <label htmlFor="locationUrl">page location: </label>
            <input type="text" name="locationUrl"></input>
            <input className="action-button" type="submit" value="create new info page"></input>
        </form>
       </div>
      
    )
}


export default CreateInfoPage