import { useState } from "react"


const ContentBlockCreateForm = () => {
    const [blocks, setBlocks] = useState([])
    const createNewBlock = () => {
        setBlocks(blocks.concat({position: blocks.length, content: "hello"}))
    }

    const modifyBlockContent = (newContent, block) => {
        setBlocks(blocks.map((b) => b.position == block.position ? {...block, content: newContent} : b))
        console.log(newContent)
    }

    return (
        <>
            <p>content blocks: </p>
            {blocks.map((block) => <Block key={block.position} block={block} modifyBlock={modifyBlockContent}></Block>)} 
            <br/>
            <button type="button" onClick={createNewBlock}>new block</button>
        </>
    )
}

const Block = ({block, modifyBlock}) => {
    const whenChanged = (event) => {
        modifyBlock(event.target.value, block)
    }

    return(
        <>
            <br/>
            <textarea type="textField" name={`block${block.position}`} value={block.content} onChange={whenChanged}></textarea>
        </>
    )
} 


export default ContentBlockCreateForm