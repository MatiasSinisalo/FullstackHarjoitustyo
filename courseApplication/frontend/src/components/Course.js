import { useApolloClient, useQuery } from "@apollo/client"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  Link,
    useParams
} from "react-router-dom"
import { GET_COURSE } from "../queries/courseQueries"
import { getCourseWithUniqueName } from "../reducers/courseReducer"
import Task from "./Task"
import TaskListings from "./TaskListings"
import "./styles/course.css"




const Course = () =>{
  const dispatch = useDispatch()
  const client = useApolloClient()
  const uniqueName = useParams().uniqueName

  const courseQuery = useQuery(GET_COURSE, {variables: {uniqueName}})
  if(courseQuery.loading)
  {
    return(<p>loading...</p>)
  }
  const course = courseQuery.data?.getCourse
  if(!course)
  {
    return(<>
    <h1>Whoops</h1>
    <Link to='/dashboard'>it seems like this course doesnt exist, click here to go back to dashboard</Link>
    </>)
  }
  console.log(course)
  
  return(
    <div className="course">
    <h1>{course.uniqueName}</h1>
    <h2>{course.name}</h2>
    <p>single course page</p>
    <TaskListings course={course}></TaskListings>
    </div>

  )
  
}
  
 

export default Course