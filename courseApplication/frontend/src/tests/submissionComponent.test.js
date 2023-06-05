import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { renderer, render, screen } from '@testing-library/react'
import client from '../client'
import { ApolloProvider } from '@apollo/client'
import { MockedProvider } from "@apollo/client/testing";
import Submission from '../components/Submission' 
import store from '../store';
import { Provider } from 'react-redux';
import { ME } from '../queries/userQueries'
import {
    BrowserRouter as Router,
  } from "react-router-dom"



jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: () => ({
        submissionId: 'abc1234',
    }),
}));


describe('Submission Component tests', () => {
    const mocks = [
        {
          request: {query: ME},
          result: {
            data: {
              me: { username: "username"}
            }
          }
        }
      ];

    const mockCourse = {teacher: {username: "username"}}
    
  

    test('submission component displays no late message if submittedDate < deadline', async () => {
        const submission={
            id: "abc1234", 
            fromUser: {username: "username"}, 
            content: "this is the answer", 
            submitted: true, 
            submittedDate: new Date(Date.now())
        }
        const task = {
            deadline: new Date(Date.now() + 1),
            submissions: [submission]
        }
       
       
        const containter = render(
          
        <MockedProvider mocks={mocks}>
           <Router>
                <Provider store={store}>
               
                        <Submission course={mockCourse} task = {task} ></Submission>
               
                </Provider>
            </Router>
        </MockedProvider>
           
            
        )
        expect(await screen.findByText("loading...")).toBeInTheDocument();
        expect(await screen.findByText("this is the answer")).toBeInTheDocument();
        expect(await screen.queryByText("this submission was returned late")).not.toBeInTheDocument();
    })

    test('submission component displays late message if submittedDate > deadline', async () => {
        const returnDate = new Date(Date.now())
        const correctDate = new Date(Date.now() + 100000)
        const submission={
            id: "abc1234", 
            fromUser: {username: "username"}, 
            content: "this is the answer", 
            submitted: true, 
            submittedDate: correctDate
        }
        const task = {
            deadline: new Date(Date.now() + 1),
            submissions: [submission]
        }

        const containter = render(
            <MockedProvider mocks={mocks}>
                <Provider store={store}>
                    <Router>
                        <Submission course={mockCourse} task = {task} ></Submission>
                    </Router>
                </Provider>
            </MockedProvider>
        )
      
        expect(await screen.findByText("loading...")).toBeInTheDocument();
        expect(await screen.findByText("this submission was returned late")).toBeInTheDocument();
    })

    test('submission component displays no late message if submittedDate does not exist', async () => {
        const submission= {
            id: "abc1234", 
            fromUser: {username: "username"}, 
            content: "this is the answer", 
            submitted: true
        }
        const containter = render(
            <MockedProvider mocks={mocks}>
                <Provider store={store}>
                    <Submission course={mockCourse} task = {{deadline: new Date(Date.now()), submissions: [submission]}} ></Submission>
                </Provider>
            </MockedProvider>
        )
        expect(await screen.findByText("this is the answer")).toBeInTheDocument();
        expect(await screen.queryByText("this submission was returned late")).not.toBeInTheDocument();
    })

    test('submission component displays no late message if submittedDate exist but is null', async () => {

        const submission={
            id: "abc1234", 
            fromUser: {username: "username"}, 
            content: "this is the answer", 
            submitted: true, 
            submittedDate: null
        }

        const containter = render(
            <MockedProvider mocks={mocks}>
                <Provider store={store}>
                    <Submission course={mockCourse} task = {{deadline: new Date(Date.now()), submissions: [submission]}} ></Submission>
                </Provider>
            </MockedProvider>
        )
        expect(await screen.findByText("this is the answer")).toBeInTheDocument();
        expect(await screen.queryByText("this submission was returned late")).not.toBeInTheDocument();
    })
})