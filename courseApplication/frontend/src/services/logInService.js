import { useMutation } from '@apollo/client'
import {LOGIN} from '../queries/userQueries'

export const useUserLogIn = () => {
    const [login, loginQueryResult] = useMutation(LOGIN)
    
    const getToken = async (username, password) => {
        const result = await login({variables: {username, password}})
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