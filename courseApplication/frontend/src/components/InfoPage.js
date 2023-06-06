import { Link, useParams } from "react-router-dom"


const InfoPage = ({course}) => {
    const infoPageUrl = useParams().infoPageUrl
    const infoPage = course.infoPages.find((page) => page.locationUrl === infoPageUrl)
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
        </>
    )
} 

export default InfoPage