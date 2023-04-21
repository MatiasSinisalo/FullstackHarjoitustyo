import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { renderer, render, screen } from '@testing-library/react'
import client from '../client'
import { ApolloProvider } from '@apollo/client'
import Submission from '../components/Submission' 
import store from '../store';
import { Provider } from 'react-redux';
describe('Submission Component tests', () => {
    test('submission component displays no late message if submittedDate < deadline', () => {
        const containter = render(
            <ApolloProvider client={client}>
                <Provider store={store}>
                    <Submission course={null} task = {{deadline: new Date(Date.now() + 1)}} submission={{id: "abc1234", content: "this is the answer", submitted: true, submittedDate: new Date(Date.now())}}></Submission>
                </Provider>
            </ApolloProvider>
        )
        const lateMessage = containter.container.querySelector(".lateMessage")
        expect(lateMessage).toBeNull()
    })

    test('submission component displays late message if submittedDate > deadline', () => {
        const containter = render(
            <ApolloProvider client={client}>
                <Provider store={store}>
                    <Submission course={null} task = {{deadline: new Date(Date.now())}} submission={{id: "abc1234", content: "this is the answer", submitted: true, submittedDate: new Date(Date.now() + 1)}}></Submission>
                </Provider>
            </ApolloProvider>
        )
        const lateMessage = containter.container.querySelector(".lateMessage")
        expect(lateMessage).not.toBeNull()
    })

    test('submission component displays no late message if submittedDate does not exist', () => {
        const containter = render(
            <ApolloProvider client={client}>
                <Provider store={store}>
                    <Submission course={null} task = {{deadline: new Date(Date.now())}} submission={{id: "abc1234", content: "this is the answer", submitted: true}}></Submission>
                </Provider>
            </ApolloProvider>
        )
        const lateMessage = containter.container.querySelector(".lateMessage")
        expect(lateMessage).toBeNull()
    })

    test('submission component displays no late message if submittedDate exist but is null', () => {
        const containter = render(
            <ApolloProvider client={client}>
                <Provider store={store}>
                    <Submission course={null} task = {{deadline: new Date(Date.now())}} submission={{id: "abc1234", content: "this is the answer", submitted: true, submittedDate: null}}></Submission>
                </Provider>
            </ApolloProvider>
        )
        const lateMessage = containter.container.querySelector(".lateMessage")
        expect(lateMessage).toBeNull()
    })
})