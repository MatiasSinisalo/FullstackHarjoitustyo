import { useApolloClient, useQuery } from "@apollo/client"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
    useParams
} from "react-router-dom"
import { GET_COURSE } from "../queries/courseQueries"
import { getCourseWithUniqueName } from "../reducers/courseReducer"
import Task from "./Task"





const Course = () =>{
  const dispatch = useDispatch()
  const client = useApolloClient()
  const uniqueName = useParams().uniqueName

  const courseQuery = useQuery(GET_COURSE, {variables: {uniqueName}})
  if(courseQuery.loading)
  {
    return(<p>loading...</p>)
  }
  const course = courseQuery.data.getCourse
  console.log(course)
  
  return(
    <>
    <h1>{course.uniqueName}</h1>
    <h2>{course.name}</h2>
    <p>single course page</p>
    {course.tasks.length > 0 ? course.tasks.map((task) => <Task task={task} key={task.id}></Task>) : <></>}
    </>

  )
  
}
  
 

export default Course