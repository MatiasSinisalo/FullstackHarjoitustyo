import {CREATE_USER, LOGIN, ME} from '../queries/userQueries'

 
export const getToken = async (username, password, appClient) => {
    try{
        const result = await appClient.mutate({mutation: LOGIN, variables: {username, password}})
        if(result.data.logIn)
        {
            return result.data.logIn
        }
    }
    catch{
        //TODO: inform user that username and password are incorrect
        console.log("incorrect password or username")
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

export const createUser = async (username, name , password, apolloClient) => {
    try{
        const newUserInfo = await apolloClient.mutate({mutation: CREATE_USER, variables: {username: username, name: name, password: password}})
        return newUserInfo.data?.createUser
    }
    catch(err)
    {
        console.log(err)
        return null
    }
}
