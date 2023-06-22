import {
    ApolloClient,
    HttpLink,
    InMemoryCache,
    split,
  } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { RetryLink } from "@apollo/client/link/retry";

import { getMainDefinition } from '@apollo/client/utilities'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'
//Backendlink is just the server url for backend and its ok that it is on the client side

const backEndURI = process.env.NODE_ENV === "production" ? `https://studastudy-backend.onrender.com` : 'http://localhost:4000'
const backEndWsURL = process.env.NODE_ENV === "production" ? `ws://studastudy-backend.onrender.com` : 'ws://localhost:4000'
const httpLink = new HttpLink({
    uri: backEndURI,
})

const wsLink = new GraphQLWsLink(createClient({
    url: backEndWsURL
}
))



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

const splitLink = new split(({query}) => {
    const def = getMainDefinition(query)
    return(
        def.kind === "OperationDefinition" &&
        def.operation === "subscription"
    )
    },
    wsLink,
    tokenHeader.concat(httpLink),
)

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
    link: splitLink,
})

export default client