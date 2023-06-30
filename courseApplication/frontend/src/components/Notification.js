import { useState } from "react"
import "./styles/notification.css"
import { useSelector } from "react-redux"


const Notification = () => {
    const notification = useSelector((state) => {return state.notification})
    console.log(notification)
    return(
        <div className="notification">
            <p className={`primary ${notification.style}`}>{notification.message}</p>
        </div>
    )
}


export default Notification