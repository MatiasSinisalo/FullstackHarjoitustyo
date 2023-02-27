import {
    ApolloClient,
    HttpLink,
    InMemoryCache,
  } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'

const httpLink = new HttpLink({
    uri: 'http://localhost:4000',
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