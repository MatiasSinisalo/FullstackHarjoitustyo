import { useState } from "react"
import { useDispatch } from "react-redux"
import { createContentBlockOnInfoPage } from "../../reducers/courseReducer"
import { useApolloClient } from "@apollo/client"


const ContentBlockCreateForm = ({blocks, course, infoPage}) => {
    const [content, setContent] = useState()
    const dispatch = useDispatch()
    const client = useApolloClient()
    const whenChanged = (event) => {
        if(event.nativeEvent.inputType === "insertLineBreak")
        {
            return
        }
        setContent(event.target.value)
    }

    const createNewBlock = async () => {
        console.log(content)
        await createContentBlockOnInfoPage(course, infoPage.id, content, blocks.length, client)
    }

    return (
        <>
            
            <textarea type="textField" name="newBlockContent" value={content} onChange={whenChanged}></textarea>
            <br/>
            <button className="action-button" type="button" onClick={createNewBlock}>new block</button>
          
        </>
    )
}

export default ContentBlockCreateForm