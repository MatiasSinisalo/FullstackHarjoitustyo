import { eachDayOfInterval, eachMonthOfInterval, getDaysInMonth, getWeeksInMonth  } from 'date-fns'
import "./styles/month.css"
import { useApolloClient } from '@apollo/client'
import { ME } from '../queries/userQueries'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'



const Day = ({currentDate, day, courseTasks}) => {
    const weekDay = day.getDay()
    const date = day.getDate()
    const month = day.getMonth()
    const year = day.getFullYear()
    const tasksThisDay = courseTasks.map((course) => {
        const tasks = course.tasks.filter((task) => new Date(parseInt(task.deadline)).getDate() === day.getDate() && year == currentDate.getFullYear())
        return {uniqueName: course.uniqueName, tasks: tasks}
    }).filter((course) => course.tasks.length > 0)

    const isCurrentDay = () => {
        return date === currentDate.getDate() && month === currentDate.getMonth() && year == currentDate.getFullYear()
    }
   
    const currentDayStyle = isCurrentDay() ? " current-date" : ""
    return(
        <div className={`day day${weekDay}${currentDayStyle} primary`}>
            <p>{day.toDateString()}</p>
            <div className='course-day-showcases'>
                {tasksThisDay.map((course) => {
                    return <CourseTasksDayShowCase key={course.uniqueName} course={course}></CourseTasksDayShowCase>
                })}
            </div>
        </div>
    )
}


const CourseTasksDayShowCase = ({course}) => {
    const [showDropDown, setDropDown] = useState(false)
    
    return (
        <>
        <div onClick={() => setDropDown(!showDropDown)} className='course-tasks-day-showcase'>
            <p>tasks: {course.tasks.length}, {course.uniqueName}</p>
        </div>

       {showDropDown ? <CourseTasksDropDown course={course}></CourseTasksDropDown> : <></>}
         
        </>
    )
}

const CourseTasksDropDown = ({course}) => {
    return (
        <div className='course-tasks-dropdown'>
        {
            course.tasks.map((task) => <TaskDayShowCase course={course} task={task}></TaskDayShowCase>)
        }
    </div>
    )
}
const TaskDayShowCase = ({course, task}) => {
    return(
        <Link to={`/course/${course.uniqueName}/task/${task.id}`}>
            <p>{task.description}</p>
        </Link>
    )
}


export default Day