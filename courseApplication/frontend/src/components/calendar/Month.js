import { eachDayOfInterval, eachMonthOfInterval, getDaysInMonth, getWeeksInMonth  } from 'date-fns'
import "../styles/month.css"
import { useApolloClient } from '@apollo/client'
import { ME } from '../../queries/userQueries'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Day from './Day'
const Month = ({currentDate, user, year, month}) => {
    
    //constains weeks in this way:
    //const week= {weekNumber, {dates}}
   
   
    const getCoursesWithTasksForMonth = (courses, month) => {
        return courses.map((course) => {
            return { uniqueName: course.uniqueName, tasks: course.tasks.filter((task) => new Date(parseInt(task.deadline)).getMonth() == month)}
        }).filter((course) => course.tasks.length > 0)
    }
    
    const courseTasksThisMonth = getCoursesWithTasksForMonth(user.attendsCourses, month)

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

export default Month