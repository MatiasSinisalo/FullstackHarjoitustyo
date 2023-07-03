import { useState } from "react"
import { removeContentBlockFromInfoPage } from "../reducers/courseReducer"
import { useApolloClient } from "@apollo/client"
import { useDispatch } from "react-redux"
import EditableBlock from "./EditableBlock"


const ContentBlock = ({course, page, block, user}) => {
    const client = useApolloClient()
    const dispatch = useDispatch()
    const [editing, setEditing] = useState(false)

 
    return (
        <div className={`contentBlock:${block.id}`}>
            {
                editing ? 
                <EditableBlock course={course} page={page} block={block}></EditableBlock>
                :
                <p>{block.content}</p>
            }
            <br/>
            {user.username === course.teacher.username ?  <ToggleEditButton editing={editing} setEditing={setEditing}></ToggleEditButton>  : <></>}
        </div>
    )
}

const ToggleEditButton = ({editing, setEditing}) => {
    return(
        <>
        {
            editing ? 
            <button className="action-button" onClick={() => setEditing(false)}>cancel</button>
            :
            <button className="action-button" onClick={() => setEditing(true)}>edit</button>
        }
        </>
    )
}


export default ContentBlock


