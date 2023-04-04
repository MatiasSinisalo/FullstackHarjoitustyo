import { useState } from "react"
import "./styles/notification.css"
import { useSelector } from "react-redux"


const Notification = () => {
    const notification = useSelector((state) => {return state.notification})
    console.log(notification)
    return(
        <>
            <p className={`notification ${notification.style}`}>{notification.message}</p>
        </>
    )
}


export default Notification