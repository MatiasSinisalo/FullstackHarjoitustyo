import { logInAsUser, createCourseAsUser, prepareTests, endTests } from './helperFunctions.cy'

before(function () {
    prepareTests()
})




describe('Course creation tests', () => {
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
})




after(async function () {
    endTests()
})
