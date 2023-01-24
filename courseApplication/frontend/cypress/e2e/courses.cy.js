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




describe('Course creation tests', () => {
    it('user can create a course', function (){
        cy.visit('http://localhost:3000')
        const usernameField = cy.get('input[name="username"]')
        const passwordField = cy.get('input[name="password"]')
        const submitButton = cy.get('input[type="submit"]')

        usernameField.click().type('username')
        cy.wait(100)
        passwordField.click().type('password1234')
        cy.wait(100)
        submitButton.click()
        cy.wait(100)
        cy.contains('Hello username')
        cy.contains('dashboard page')
        cy.contains('Create new Course').click()
        cy.wait(100)

        const courseUniqueNameField = cy.get('input[name=courseUniqueName]')
        const courseNameField = cy.get('input[name=courseName]')
        const courseSubmitButton = cy.get('input[type="submit"]')
        courseUniqueNameField.type("unique name of the course")
        
        cy.wait(100)
        courseNameField.type("courses name")
        cy.wait(100)
        courseSubmitButton.click()
        cy.wait(100)

        cy.visit('http://localhost:3000/CourseBrowser')
        cy.wait(100)
        cy.contains("unique name of the course")
        cy.contains("courses name")

    })
})
/*
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
*/