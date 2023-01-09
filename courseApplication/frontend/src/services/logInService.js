import client from '../client'
import {LOGIN} from '../queries/userQueries'

export const useUserLogIn = () => {
   
    
    const getToken = async (username, password) => {
        const result = await client.mutate({mutation: LOGIN, variables: {username, password}})
        if(result.data.logIn)
        {
            console.log("logged in")
            return result.data.logIn
        }
        console.log(result)
        return undefined
    }

    return getToken
}