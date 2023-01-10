import { useState } from 'react'
import {LOGIN, ME} from '../queries/userQueries'

export const useUserLogIn = (apolloClient) => {
    const appClient = apolloClient
    
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

export const useUser = (apolloClient) => {
    const getToken = useUserLogIn(apolloClient)

    const LogInAsUser = async (username, password) => {
        const token = await getToken(username, password)
        if(token)
        {
            localStorage.setItem('courseApplicationUserToken', token.value)
            const userInfo = await apolloClient.query({query: ME})
            //console.log(userInfo)
            return {username: userInfo.data.me.username, name: userInfo.data.me.name, token: token.value}
        }
        return null
    }

    return LogInAsUser
    
} 

export const LogInAsUser = async (username, password, apolloClient) => {
    const getToken = useUserLogIn(apolloClient)
    const token = await getToken(username, password)
    if(token)
    {
        localStorage.setItem('courseApplicationUserToken', token.value)
        const userInfo = await apolloClient.query({query: ME})
        //console.log(userInfo)
        return {username: userInfo.data.me.username, name: userInfo.data.me.name, token: token.value}
    }
    return null
}