import { prepareTests, endTests, logInAsUser, createCourseAsUser, joinCourseAsUser } from "./helperFunctions.cy"




beforeEach(function () {
    prepareTests()
})

describe('student removal from course tests', () => {
    it('teacher can remove a student from the course', () => {
        logInAsUser("username", "password1234")
        createCourseAsUser("course for removal testing", "course name")
        cy.contains("Log Out").click()
        
        logInAsUser("second username", "password1234")
        joinCourseAsUser("course for removal testing", "second username")
        cy.contains("Log Out").click()

        logInAsUser("username", "password1234")
        cy.visit('http://localhost:3000/dashboard/', {onBeforeLoad(win) {
            cy.stub(win, 'prompt').returns("second username")
        }})

        cy.contains("See Teachers Course Page").click()
        cy.contains("see course participants").click()
        const studentInfo = cy.contains("second username").parent()
        
        cy.intercept('POST', 'http://localhost:4000/', (request) => {
            if(request.body.query.includes('removeStudent'))
            {
                request.alias = "removeStudent"
            }
        })
        studentInfo.contains("remove from course").click()
        cy.wait("@removeStudent").then((communication) => {
            const variables = communication.request.body.variables
            expect(variables.username).to.equal("second username")
        })

        cy.contains("Log Out").click()
        logInAsUser("second username", "password1234")
        cy.contains("course for removal testing").should("not.exist")

    })
})

after(function (){
    endTests()
})