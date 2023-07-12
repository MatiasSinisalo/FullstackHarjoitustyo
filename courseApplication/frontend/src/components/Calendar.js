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

const Week = (year, month, week) => {

}

const Month = ({currentDate, user, year, month}) => {
    
    //constains weeks in this way:
    //const week= {weekNumber, {dates}}
    const courseTasksThisMonth = user.attendsCourses.map((course) => {
        return { uniqueName: course.uniqueName, tasks: course.tasks.filter((task) => new Date(parseInt(task.deadline)).getMonth() == month)}
    }).filter((course) => course.tasks.length > 0)
   
    const daysInMonth = getDaysInMonth(new Date(year, month))
    const days = eachDayOfInterval({start: new Date(year, month, 1), end: new Date(year, month, daysInMonth)})
    return(
        <>
        <h1>{month + 1} {year}</h1>
        <div className={"month"}>
            
            
            <p className="day1">Mon</p>
            <p className="day2">Tue</p>
            <p className="day3">Wed</p>
            <p className="day4">Thu</p>
            <p className="day5">Fri</p>
            <p className="day6">Sat</p>
            <p className="day0">Sun</p>
            
            {days.map(day => <Day  currentDate={currentDate} courseTasks={courseTasksThisMonth} day={day} key={`${day.getDate()}${day.getMonth()}${day.getFullYear()}`}/>)}
        </div>
        </>
    )
}
/*
{display: grid;
    grid-template-areas: 'mon tue wed thur fri sat sun'}
*/

const Calendar = () =>{
    const client = useApolloClient()
    const user = client.readQuery({query: ME})?.me
    
    const currentDate = new Date()
   
    const [displayDate, setDisplayDate] = useState(new Date())
    const displayMonth = displayDate.getMonth()
    const displayYear = displayDate.getFullYear()
    
    const months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    
    const nextMonth = () => {
        const nextMonth = displayDate.getMonth() + 1
        const newDate = new Date(displayDate.setMonth(nextMonth))
        console.log(newDate)
        setDisplayDate(newDate)
    }

    const prevMonth = () => {
        const prevMonth = displayDate.getMonth() - 1;
        const newDate = new Date(displayDate.setMonth(prevMonth))
        setDisplayDate(newDate)
    }

    const currentMonth = () => {
        setDisplayDate(currentDate)
    }
    return(
    <div>
      <p>calendar page</p>
        <button onClick={prevMonth}>prev month</button>
        <button onClick={currentMonth}>this month</button>
        <button onClick={nextMonth}>next month</button>
       <Month currentDate={currentDate} user={user} year={displayYear} month={displayMonth} key={`${displayMonth}${displayYear}`}/>
    </div>
    
    
    )
}

export default Calendar
  