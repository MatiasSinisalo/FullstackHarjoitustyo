import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { renderer, render, screen } from '@testing-library/react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LogIn from '../components/LogIn'
import client from '../client'
import { ApolloProvider } from '@apollo/client'
import { createMemoryHistory } from 'history';


describe('LogIn Component tests', () => {
    test('login component shows login form correctly', () => {
        const history = createMemoryHistory({ initialEntries: ["/"]})
        const containter = render(
            <ApolloProvider client={client}>
                <Router history={history}>
                    <Routes>
                            <Route path="/" element={<LogIn/>}/>
                    </Routes>
                </Router>
            </ApolloProvider>
        )
        const usernameField = containter.container.querySelector('input[name="username"]')
        expect(usernameField).not.toBeNull()
        
        const passwordField = containter.container.querySelector('input[name="password"]')
        expect(passwordField).not.toBeNull()
    
        const formSubmitButton = screen.getByText("LogIn")
        expect(formSubmitButton).toBeDefined()
    })
})
