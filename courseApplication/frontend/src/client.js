import {
    ApolloClient,
    HttpLink,
    InMemoryCache,
  } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { RetryLink } from "@apollo/client/link/retry";

//Backendlink is just the server url for backend and its ok that it is on the client side

const backEndURI = process.env.NODE_ENV === "production" ? `https://studastudy-backend.onrender.com` : 'http://localhost:4000'

const httpLink = new HttpLink({
    uri: backEndURI,
})

const tokenHeader = setContext((_, { headers }) => {
    const token = localStorage.getItem('courseApplicationUserToken')
    if(token)
    {
        return {headers: {...headers, authorization: `bearer ${token}`}}
    }
    else
    {
        return {headers: {...headers, authorization: null}}
    }
})

//backend returns tasks: null when making getAllCourses query, in case tasks are null replace them with empty array
const memoryCache = new InMemoryCache({typePolicies: {
   Course:{
        fields: {
            tasks:{
                read(tasks){
                    return tasks == null ? [] : tasks
                }
            },
        },
   },
}})


const client = new ApolloClient({
    cache: memoryCache,
    link: tokenHeader.concat(httpLink),
})

export default client