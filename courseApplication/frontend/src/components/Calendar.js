import { useApolloClient } from '@apollo/client'
import { ME } from '../queries/userQueries'
import { useState } from 'react'
import Month from './Month'


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
        <h1>Calendar</h1>
        <button onClick={prevMonth}>prev month</button>
        <button onClick={currentMonth}>this month</button>
        <button onClick={nextMonth}>next month</button>
       <Month currentDate={currentDate} user={user} year={displayYear} month={displayMonth} key={`${displayMonth}${displayYear}`}/>
    </div>
    
    
    )
}

export default Calendar
  