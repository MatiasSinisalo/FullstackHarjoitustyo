
const EditableBlock = ({block, modifyBlock}) => {
    const whenChanged = (event) => {
        if(event.nativeEvent.inputType === "insertLineBreak")
        {
            return
        }
        modifyBlock(event.target.value, block)
    }

    return(
        <>
            <br/>
            <textarea type="textField" name={`block${block.position}`} value={block.content} onChange={whenChanged}></textarea>
        </>
    )
} 

export default EditableBlock