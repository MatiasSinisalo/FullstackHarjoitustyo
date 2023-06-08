import { useState } from "react"
import { removeContentBlockFromInfoPage } from "../reducers/courseReducer"
import { useApolloClient } from "@apollo/client"
import { useDispatch } from "react-redux"


const ContentBlock = ({course, page, block, user}) => {
    const client = useApolloClient()
    const dispatch = useDispatch()
    const deleteBlock = () => {
        dispatch(removeContentBlockFromInfoPage(course, page.id, block.id, client))
        console.log("deleting block")
    }

    return (
        <div className={`contentBlock:${block.id}`}>
            <p>{block.content}</p>
            {user.username === course.teacher.username ? <button onClick={deleteBlock}>delete</button>  : <></>}
            
        </div>
    )
}

export default ContentBlock


