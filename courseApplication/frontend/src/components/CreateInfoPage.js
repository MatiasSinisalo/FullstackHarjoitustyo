import { useApolloClient } from "@apollo/client"
import { useState } from "react"
import { useDispatch } from "react-redux"
import { createInfoPageOnCourse } from "../reducers/courseReducer"



const CreateInfoPage = ({course}) => {
    const dispatch = useDispatch()
    const client = useApolloClient()
    const createInfoPage = (event) => {
        event.preventDefault()
        const pageUrl = event.target.locationUrl.value
        dispatch(createInfoPageOnCourse(course, pageUrl, client))
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