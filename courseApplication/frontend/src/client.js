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
    uri: `https://studastudy-backend.onrender.com` || 'http://localhost:4000',
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

const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: tokenHeader.concat(httpLink),
})

export default client