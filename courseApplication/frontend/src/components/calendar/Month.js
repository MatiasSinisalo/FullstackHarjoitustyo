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
   
    const getCoursesWithTasksForDay = (courses, day) => {
        return courses.map((course) => {
            const tasks = course.tasks.filter((task) => {
                const deadlineDate = new Date(parseInt(task.deadline))
                const sameDay = deadlineDate.getDate() === day.getDate()
                const sameMonth = deadlineDate.getMonth() === day.getMonth()
                const sameYear = deadlineDate.getFullYear() === day.getFullYear()
                return sameDay && sameMonth && sameYear
            })
            return {uniqueName: course.uniqueName, tasks: tasks}
        }).filter((course) => course.tasks.length > 0)
    }
    
    const daysInMonth = getDaysInMonth(new Date(year, month))
    const days = eachDayOfInterval({start: new Date(year, month, 1), end: new Date(year, month, daysInMonth)})

    const courseTasksByDay = days.map((day) => {
        const coursesWithTasksOnDay = getCoursesWithTasksForDay(user.attendsCourses, day)
        return {date: day, courses: coursesWithTasksOnDay ? coursesWithTasksOnDay : []}
    })
   
   
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
            
            {courseTasksByDay.map(day => <Day  currentDate={currentDate} courses={day.courses} day={day.date} key={`${day.date.getDate()}${day.date.getMonth()}${day.date.getFullYear()}`}/>)}
        </div>
        </>
    )
}

export default Month