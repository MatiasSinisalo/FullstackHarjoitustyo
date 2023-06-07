import { useState } from "react"


const ContentBlockCreateForm = ({blocks, setBlocks}) => {
    const [content, setContent] = useState()
    const whenChanged = (event) => {
        if(event.nativeEvent.inputType === "insertLineBreak")
        {
            return
        }
        setContent(event.target.value)
    }

    const createNewBlock = () => {
        console.log(content)
        setBlocks(blocks.concat({position: blocks.length, content}))
    }

    return (
        <>
            
            <textarea type="textField" name="newBlockContent" value={content} onChange={whenChanged}></textarea>
            <br/>
            <button type="button" onClick={createNewBlock}>new block</button>
          
        </>
    )
}

export default ContentBlockCreateForm