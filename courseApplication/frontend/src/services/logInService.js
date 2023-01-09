import client from '../client'
import {LOGIN} from '../queries/userQueries'

export const useUserLogIn = (apolloClient) => {
    const appClient = apolloClient == undefined ? client : apolloClient
    
    const getToken = async (username, password) => {
        const result = await appClient.mutate({mutation: LOGIN, variables: {username, password}})
        console.log(result)
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