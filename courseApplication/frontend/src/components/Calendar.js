import { eachDayOfInterval, eachMonthOfInterval, getDaysInMonth, getWeeksInMonth  } from 'date-fns'
import "./month.css"
const Day = ({day}) => {
    const weekDay = day.getDay()
    const date = day.getDate()
    const month = day.getMonth()
    const year = day.getFullYear()
    
    return(
        <>
        <p className={`day${weekDay - 1}`}>{date}</p>
        </>
    )
}

const Week = (year, month, week) => {

}

const Month = ({year, month}) => {
    
    //constains weeks in this way:
    //const week= {weekNumber, {dates}}
    
    const daysInMonth = getDaysInMonth(new Date(year, month))
    const days = eachDayOfInterval({start: new Date(year, month, 1), end: new Date(year, month, daysInMonth)})
    console.log(days)
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
           
            
            {days.map(day => <Day day={day} key={`${day.getDate()}${day.getMonth()}${day.getFullYear()}`}/>)}
        </div>
        </>
    )
}
/*
{display: grid;
    grid-template-areas: 'mon tue wed thur fri sat sun'}
*/

const Calendar = () =>{
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    console.log(currentDate.getFullYear())
    console.log(currentDate.getMonth())
    console.log(currentDate.getDate())
  
    const months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
  
    return(
      <>
      <p>calendar page</p>
   
      {months.map(month => <Month year={currentYear} month={month} key={`${month}${currentYear}`}/>)}
      
      </>
  
    )
}

export default Calendar
  