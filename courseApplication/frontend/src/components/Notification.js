import { useState } from "react"
import "./styles/notification.css"
import { useSelector } from "react-redux"


const Notification = () => {
    const notification = useSelector((state) => state.notification)

    return(
        <>
            <p className={notification.style}>{notification.message}</p>
        </>
    )
}


export default Notification