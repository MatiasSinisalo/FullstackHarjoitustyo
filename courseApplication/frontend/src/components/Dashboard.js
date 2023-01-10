import { useSelector } from "react-redux"

const Dashboard = () =>{
  const user = useSelector((store) => {return store.user})
  console.log(user)
    return(
      <>
      <h1>Hello {user.username}</h1>
      <p>dashboard page</p>
      </>
  
    )
  }
  
export default Dashboard