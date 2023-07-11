import { eachDayOfInterval, eachMonthOfInterval, getDaysInMonth, getWeeksInMonth  } from 'date-fns'
import "./styles/month.css"
import { useApolloClient } from '@apollo/client'
import { ME } from '../queries/userQueries'
import { Link } from 'react-router-dom'
const Day = ({day, courseTasks}) => {
    const weekDay = day.getDay()
    const date = day.getDate()
    const month = day.getMonth()
    const year = day.getFullYear()
    const tasksThisDay = courseTasks.map((course) => {
        return {uniqueName: course.uniqueName, tasks: course.tasks.filter((task) => new Date(parseInt(task.deadline)).getDate() === day.getDate())}
    })
    console.log(tasksThisDay)
    return(
        <div className={`day${weekDay - 1}`}>
        <p>{date}</p>
        {tasksThisDay.map((course) => {
           return course.tasks.map((task) => <p key={task.id}>course: {course.uniqueName}  description: {task.description}</p>)
        })}
        </div>
    )
}

const Week = (year, month, week) => {

}

const Month = ({user, year, month}) => {
    
    //constains weeks in this way:
    //const week= {weekNumber, {dates}}
    const courseTasksThisMonth = user.attendsCourses.map((course) => {
        return { uniqueName: course.uniqueName, tasks: course.tasks.filter((task) => new Date(parseInt(task.deadline)).getMonth() == month)}
    })
   
    const daysInMonth = getDaysInMonth(new Date(year, month))
    const days = eachDayOfInterval({start: new Date(year, month, 1), end: new Date(year, month, daysInMonth)})
    return(
        <>
        <h1>{month + 1} {year}</h1>
        <div className={"month"}>
            
            <p className="day0">Mon</p>
            <p className="day1">Tue</p>
            <p className="day2">Wed</p>
            <p className="day3">Thur</p>
            <p className="day4">Fri</p>
            <p className="day5">Sat</p>
            <p className="day6">Sun</p>
           
            
            {days.map(day => <Day courseTasks={courseTasksThisMonth} day={day} key={`${day.getDate()}${day.getMonth()}${day.getFullYear()}`}/>)}
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
    const currentYear = currentDate.getFullYear()
   
  
    const months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
  
    return(
    <div>
      <p>calendar page</p>
      {months.map((month) => <Month user={user} year={currentYear} month={month} key={`${month}${currentYear}`}/>)}
    </div>
    
    
    )
}

export default Calendar
  