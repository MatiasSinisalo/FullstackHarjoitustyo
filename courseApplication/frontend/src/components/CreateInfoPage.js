import { useState } from "react"



const CreateInfoPage = () => {
    const [blocks, setBlocks] = useState([])
    const createNewBlock = () => {
        setBlocks(blocks.concat({position: blocks.length, content: "hello"}))
    }

    const modifyBlockContent = (newContent, block) => {
        setBlocks(blocks.map((b) => b.position == block.position ? {...block, content: newContent} : b))
        console.log(newContent)
    }
    const createInfoPage = (event) => {
        event.preventDefault()
        console.log(blocks)
    }
    return(
       <div onSubmit={createInfoPage}>
       <form onSubmit={createInfoPage}>
        <label htmlFor="locationUrl">page location: </label>
        <input type="text" name="locationUrl"></input>
        <br/>
        <p>content blocks: </p>
        {blocks.map((block) => <Block key={block.position} block={block} modifyBlock={modifyBlockContent}></Block>)} 
        <br/>
        <button type="button" onClick={createNewBlock}>new block</button>
        <br/>
        <br/>
        <input type="submit" value="create new info page"></input>
       </form>
       
        <br/>
       
       </div>
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

export default CreateInfoPage