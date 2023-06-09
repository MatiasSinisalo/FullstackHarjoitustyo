import { Link, useParams } from "react-router-dom"
import ContentBlockCreateForm from "./ContentBlockCreateForm"
import { useState } from "react"
import ContentBlock from "./ContentBlock"
import { useDispatch } from "react-redux"
import { removeInfoPageFromCourse } from "../reducers/courseReducer"
import { useApolloClient } from "@apollo/client"


const InfoPage = ({course, user}) => {
    const dispatch = useDispatch()
    const client = useApolloClient()
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

    const removePage = () => {
        dispatch(removeInfoPageFromCourse(course, infoPage, client))
    }
    return (
        <>
        <h1>{infoPage.locationUrl}</h1>
        {course.teacher.username === user.username ? <button onClick={removePage}>remove page</button> : <></>}
        <br/>
        {blocks.map((block) => <ContentBlock key={block.id} block={block} user={user} course={course} page={infoPage}></ContentBlock>)}
        {course.teacher.username === user.username ? 
            <ContentBlockCreateForm startingBlocks={infoPage.contentBlocks} blocks={blocks} course={course} infoPage={infoPage}></ContentBlockCreateForm>
        :
        <></>
        }
        
        </>
    )
} 

export default InfoPage