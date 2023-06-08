import { useState } from "react"


const ContentBlock = ({block, user, course}) => {
    const deleteBlock = () => {
        console.log("deleting block")
    }

    return (
        <div className={`contentBlock:${block.id}`}>
            <p>{block.content}</p>
            {user.username === course.teacher.username}
            <button onClick={deleteBlock}>delete</button> 
        </div>
    )
}

export default ContentBlock


