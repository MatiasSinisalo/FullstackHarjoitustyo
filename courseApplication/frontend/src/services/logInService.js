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
        const userInfo = await apolloClient.query({query: ME})
        //console.log(userInfo)
        return {username: userInfo.data.me.username, name: userInfo.data.me.name, token: token.value}
    }
    return null
}
