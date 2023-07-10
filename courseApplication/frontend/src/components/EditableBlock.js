import { useApolloClient } from "@apollo/client"
import { useDispatch } from "react-redux"
import { modifyContentBlock, removeContentBlockFromInfoPage } from "../reducers/courseReducer"
import { useState } from "react"

const EditableBlock = ({course, page, block}) => {
    const client = useApolloClient()
    const dispatch = useDispatch()
    const [content, setContent] = useState(block.content)
    const whenChanged = async (event) => {
        if(event.nativeEvent.inputType === "insertLineBreak")
        {
            return
        }
        setContent(event.target.value)
    }

    const deleteBlock = async () => {
        await removeContentBlockFromInfoPage(course, page.id, block.id, client)
        console.log("deleting block")
    }


    const modifyBlock = async () => {
        console.log("saving changes to block!")
        await modifyContentBlock(course, page.id, block.id, content, client)
    }

    return(
        <>
            <br/>
            <textarea type="textField" name={`block${block.position}`} value={content} onChange={whenChanged}></textarea>
            <br/>
            <EditButtons deleteBlock={deleteBlock} saveBlock={modifyBlock}></EditButtons>
        </>
    )
} 

const EditButtons = ({deleteBlock, saveBlock}) => {
    return (
        <>
            <button className="dangerous-button" onClick={deleteBlock}>delete</button>
            <button className="action-button"    onClick={saveBlock}>save</button>
        </>
    )
}

export default EditableBlock