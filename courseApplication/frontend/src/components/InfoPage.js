import { Link, useParams } from "react-router-dom"
import ContentBlockCreateForm from "./ContentBlockCreateForm"
import { useState } from "react"


const InfoPage = ({course, user}) => {
    const infoPageUrl = useParams().infoPageUrl
    const infoPage = course.infoPages.find((page) => page.locationUrl === infoPageUrl)
    const blocks = infoPage?.contentBlocks
    console.log(infoPageUrl)
    console.log(infoPage)
    if(!infoPage)
    {
        return(
            <Link to={`/course/${course.uniqueName}`}>it seems this page does not exist, click here to go back</Link>
        )
    }

    return (
        <>
        <h1>{infoPage.locationUrl}</h1>
        <p>this is an info page</p>
        {blocks.map((b) => <p>{b.content}</p>)}
        {course.teacher.username === user.username ? 
            <ContentBlockCreateForm startingBlocks={infoPage.contentBlocks} blocks={blocks} course={course} infoPage={infoPage}></ContentBlockCreateForm>
        :
        <></>
        }
        
        </>
    )
} 

export default InfoPage