import client from '../client'
import {LOGIN} from '../queries/userQueries'

export const useUserLogIn = (apolloClient) => {
    const appClient = apolloClient == undefined ? client : apolloClient
    
    const getToken = async (username, password) => {
        const result = await appClient.mutate({mutation: LOGIN, variables: {username, password}})
        if(result.data.logIn)
        {
            return result.data.logIn
        }
       
        return undefined
    }

    return getToken
}