

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
        const usernameField = cy.get('input[name="username"]')
        const passwordField = cy.get('input[name="password"]')
        const submitButton = cy.get('input[type="submit"]')
    })

    it('user can log in with correct credentials', async function (){
        cy.visit('http://localhost:3000')
        const usernameField = cy.get('input[name="username"]')
        const passwordField = cy.get('input[name="password"]')
        const submitButton = cy.get('input[type="submit"]')

        usernameField.click().type('username')
        cy.wait(200)
        passwordField.click().type('password1234')
        cy.wait(200)
        submitButton.click()
        cy.wait(200)
        cy.contains('Hello username')
        cy.contains('dashboard page')
        cy.contains('Create new Course')

        cy.contains('Log Out').click()
    })

    
    it('user can not log in with incorrect credentials', async function (){
        cy.visit('http://localhost:3000')
        const usernameField = cy.get('input[name="username"]')
        const passwordField = cy.get('input[name="password"]')
        const submitButton = cy.get('input[type="submit"]')

        usernameField.click().type('incorrect username')
        cy.wait(200)
        passwordField.click().type('incorrect password')
        cy.wait(200)
        submitButton.click()
        cy.contains('please log in')
    })
    

    it('user log out logs user out of the app', async function (){
        cy.visit('http://localhost:3000')
        const usernameField = cy.get('input[name="username"]')
        const passwordField = cy.get('input[name="password"]')
        const submitButton = cy.get('input[type="submit"]')

        usernameField.click().type('username')
        cy.wait(200)
        passwordField.click().type('password1234')
        cy.wait(200)
        submitButton.click()
        cy.wait(200)
        cy.contains('Hello username')
        cy.contains('dashboard page')
        cy.contains('Create new Course')

        cy.contains('Log Out').click()
        cy.contains('please log in')
        const token = localStorage.getItem('courseApplicationUserToken')
        expect(token).to.equal(null)
    })

})

after(async function () {
    localStorage.removeItem('courseApplicationUserToken')
    await cy.request({
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

   
})