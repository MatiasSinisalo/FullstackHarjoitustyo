import { prepareTests, endTests, logInAsUser, createCourseAsUser, joinCourseAsUser, createTaskOnCourseAsUser, createSubmissionToATask } from "./helperFunctions.cy"


beforeEach(function () {
    prepareTests()
 })

 after(function (){
    endTests()
})

describe('submission removal tests', () => {
    it('user can remove an created submission', () => {
        logInAsUser("username", "password1234")
        const course = {
            uniqueName: "this is a course for testing submission removal",
            name:  "name of the course"
        }
        createCourseAsUser(course.uniqueName, course.name)
        createTaskOnCourseAsUser(course.uniqueName, "this is a task", new Date(Date.now()))
        createSubmissionToATask( "this is a task","this is an answer to a task")

        cy.intercept('POST', 'http://localhost:4000', (request) => {
            if(request.body.query.includes('removeSubmissionFromCourseTask'))
            {
                request.alias = "removeSolution"
            }
        }).as("removeSolution")
        cy.get(`[class*="submission:"]`).contains("remove").click()
        cy.wait("@removeSolution").then((communication) => {
            const response = communication.response.body.data.removeSubmissionFromCourseTask
            expect(response).to.equal(true)
        })

        cy.get(`[class*="submission:"]`).should("not.exist")
        cy.reload(true)
        logInAsUser("username", "password1234")
        cy.contains("See Teachers Course Page").click()
        cy.get('[class*="submission:"]').should('not.exist');
    })
})