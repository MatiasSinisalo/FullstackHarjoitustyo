

import { CREATE_USER } from "../../src/queries/userQueries"

before(function () {
    cy.request({
        method: 'POST',
        url: 'http://localhost:4000',
        body: {
            query:`
            mutation Mutation {
                reset
            }`,
            operationName: 'Mutation'
        }
    })

    

    cy.request({
        method: 'POST',
        url: 'http://localhost:4000',
        body: {
            query:`
            mutation Mutation($username: String!, $name: String!, $password: String!) {
              createUser(username: $username, name: $name, password: $password) {
                name
                username
              }
            }
            `,
            variables: {username: "username", name: "users name", password: "password1234"},
            operationName: 'Mutation'
        }
    })
})

describe('Log in tests', () => {
    it('Log in form is found from main page', async function (){
        cy.visit('http://localhost:3000')
        cy.contains('Log in page')
    })
})

