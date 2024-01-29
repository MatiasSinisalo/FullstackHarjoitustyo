import {AUTHENTICATE_GOOGLE_USER, CREATE_USER, FINALIZE_GOOGLE_USER_CREATION, LOGIN, ME} from '../queries/userQueries'

const LogInAsUser = async (username, password, apolloClient) => {
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

const getUserData = async (apolloClient) => {
    const userInfo = await apolloClient.query({query: ME})
    return {username: userInfo.data.me.username, name: userInfo.data.me.name}
}

const createUser = async (username, name , password, apolloClient) => {
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


const authenticateGoogleUser = async (googleToken, apolloClient) => {
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

const finalizeGoogleUserCreation = async (username, createUserToken,apolloClient) => {
    try{
        const newUserInfo = await apolloClient.mutate({mutation: FINALIZE_GOOGLE_USER_CREATION, variables: {username: username, createUserToken: createUserToken}})
        return newUserInfo.data?.finalizeGoogleUserCreation
    }
    catch(err)
    {
        console.log(err)
        return {error: err}
    }
}

const authenticateHYUser = async (HYToken, apolloClient) => {
    try{
       
    }
    catch(err)
    {
        console.log(err)
        return {error: err}
    }
}



export default {
    LogInAsUser, 
    getUserData,
    createUser,
    authenticateGoogleUser,
    finalizeGoogleUserCreation,
    authenticateHYUser
}