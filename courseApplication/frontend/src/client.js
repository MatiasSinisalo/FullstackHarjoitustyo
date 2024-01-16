import {
    ApolloClient,
    ApolloLink,
    HttpLink,
    InMemoryCache,
    concat,
    split,
  } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { RetryLink } from "@apollo/client/link/retry";

import { getMainDefinition } from '@apollo/client/utilities'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'
//Backendlink is just the server url for backend and its ok that it is on the client side

const backEndURI = process.env.NODE_ENV === "production" ? `https://backend-ohtuprojekti-staging.apps.ocp-test-0.k8s.it.helsinki.fi/` : 'http://localhost:4000'
const backEndWsURL = process.env.NODE_ENV === "production" ? `wss://backend-ohtuprojekti-staging.apps.ocp-test-0.k8s.it.helsinki.fi/` : 'ws://localhost:4000'

const httpLink = new HttpLink({
    uri: backEndURI,
})

const getAuth = () => {
    const token = localStorage.getItem('courseApplicationUserToken')
    if(token)
    {
        return `bearer ${token}`
    }
    else{
        return null
    }
}

const wsLinkHeader = setContext((request) => {
    console.log(request)
    return request
})

const wsLink = new GraphQLWsLink(createClient({
        url: backEndWsURL,
        connectionParams: () => ({
            Authorization: getAuth()
        })
    })
)



const tokenHeader = setContext((a, b) => {
    console.log(a)
    console.log(b)
    const headers = b.headers
   
    return {headers: {...headers, authorization: getAuth()}}
   
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