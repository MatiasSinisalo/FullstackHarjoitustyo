import {AUTHENTICATE_GOOGLE_USER, CREATE_USER, LOGIN, ME} from '../queries/userQueries'

 export const LogInAsUser = async (username, password, apolloClient) => {
    try{
        const loginQuery = await apolloClient.mutate({mutation: LOGIN, variables: {username, password}})
        
        const token = loginQuery.data.logIn
        localStorage.setItem('courseApplicationUserToken', token.value)
        const userData = await getUserData(apolloClient)
        return {...userData, token: token.value}
    }
    catch(err)
    {
        return {error: err}
    }
}

export const getUserData = async (apolloClient) => {
    const userInfo = await apolloClient.query({query: ME})
    return {username: userInfo.data.me.username, name: userInfo.data.me.name}
}

export const createUser = async (username, name , password, apolloClient) => {
    try{
        const newUserInfo = await apolloClient.mutate({mutation: CREATE_USER, variables: {username: username, name: name, password: password}})
        return newUserInfo.data?.createUser
    }
    catch(err)
    {
        console.log(err)
        return {error: err}
    }
}


export const sendAuthenticateGoogleUser = async (googleToken, apolloClient) => {
    try{
        const newUserInfo = await apolloClient.mutate({mutation: AUTHENTICATE_GOOGLE_USER, variables: {googleToken: googleToken}})
        return newUserInfo.data?.authenticateGoogleUser
    }
    catch(err)
    {
        console.log(err)
        return {error: err}
    }
}
