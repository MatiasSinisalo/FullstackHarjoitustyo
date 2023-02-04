import { createCourse } from "../../../backend/src/tests/courseTestQueries"

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
            variables: {username: "second username", name: "second users name", password: "password1234"},
            operationName: 'Mutation'
        }
    })
})




describe('Course creation tests', () => {

    const logInAsUser = (username, password) => {
        cy.visit('http://localhost:3000')
        const usernameField = cy.get('input[name="username"]')
        const passwordField = cy.get('input[name="password"]')
        const submitButton = cy.get('input[type="submit"]')

        usernameField.click().type(username)
        cy.wait(100)
        passwordField.click().type(password)
        cy.wait(100)
        submitButton.click()
        cy.wait(100)
        cy.contains('Hello username')
        cy.contains('dashboard page')
       
        cy.wait(100)
    }


    const createCourseAsUser = (courseUniqueName, courseName) => {
        cy.contains('Create new Course').click()
        const courseUniqueNameField = cy.get('input[name=courseUniqueName]')
        const courseNameField = cy.get('input[name=courseName]')
        const courseSubmitButton = cy.get('input[type="submit"]')
       
        courseUniqueNameField.type(courseUniqueName)
        cy.wait(100)

        courseNameField.type(courseName)
        cy.wait(100)
        
        courseSubmitButton.click()
        cy.wait(100)
    }

    it('user can create a course', function (){
        logInAsUser("username", "password1234")


        createCourseAsUser("unique name of the course", "courses name")

        cy.visit('http://localhost:3000/CourseBrowser')
        cy.wait(500)
        cy.contains("unique name of the course")
        cy.contains("courses name")

        cy.contains("Log Out").click()
    })


    it('user can not create a course with doublicate unque name', function (){
        logInAsUser("username", "password1234")



        cy.intercept('POST', 'http://localhost:4000').as('serverResponse')
        createCourseAsUser("unique name of the course", "courses name")

        cy.wait('@serverResponse').then((response) => {
            const serverError = response.response.body.errors[0]
            expect(serverError.message).to.equal("Course uniqueName must be unique")
            console.log(response)
        })

        cy.contains("Log Out").click()
    })

    it('user can join and leave a course created by the user itself', function (){
        logInAsUser("username", "password1234")

        createCourseAsUser("this course is created by user username", "courses name")

        cy.visit('http://localhost:3000/CourseBrowser')
        cy.wait(500)
        const courseShowCase = cy.contains("this course is created by user username").parent()
        const joinButton = courseShowCase.contains("button","Join")
        joinButton.click()
        cy.wait(100)

        const leaveButton = courseShowCase.contains("button","Leave course")
        leaveButton.click()
        cy.wait(500)

        cy.contains("Log Out").click()
    })

    it('user can join and leave a course created by another user', function (){
        logInAsUser("second username", "password1234")

        createCourseAsUser("this course is created by user second username", "courses name")
        cy.visit('http://localhost:3000/CourseBrowser')
        cy.wait(500)
        cy.contains("this course is created by user second username")
        cy.contains("Log Out").click()

        logInAsUser("username", "password1234")
        cy.visit('http://localhost:3000/CourseBrowser')
        cy.wait(500)
        const courseShowCase = cy.contains("this course is created by user second username").parent()
        const joinButton = courseShowCase.contains("button","Join")
        joinButton.click()
        cy.wait(100)

        const leaveButton = courseShowCase.contains("button","Leave course")
        leaveButton.click()
        cy.wait(500)


        cy.contains("Log Out").click()

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
