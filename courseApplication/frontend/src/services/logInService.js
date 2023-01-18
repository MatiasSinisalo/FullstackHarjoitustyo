import {LOGIN, ME} from '../queries/userQueries'

 
export const getToken = async (username, password, appClient) => {
    const result = await appClient.mutate({mutation: LOGIN, variables: {username, password}})
    if(result.data.logIn)
    {
        return result.data.logIn
    }
    
    return undefined
}


export const LogInAsUser = async (username, password, apolloClient) => {
    const token = await getToken(username, password, apolloClient)
    if(token)
    {
        localStorage.setItem('courseApplicationUserToken', token.value)

        const userData = await getUserData(apolloClient)
        return {...userData, token: token.value}
    }
    return null
}

export const getUserData = async (apolloClient) => {
    const userInfo = await apolloClient.query({query: ME})
    return {username: userInfo.data.me.username, name: userInfo.data.me.name}
}
