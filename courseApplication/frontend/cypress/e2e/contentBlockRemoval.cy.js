import { prepareTests, endTests, logInAsUser, createCourseAsUser, joinCourseAsUser, createInfoPage, visitCoursePageAsStudentFromDashboard, createContentBlock } from "./helperFunctions.cy"


beforeEach(function () {
    prepareTests()
})

after(function (){
    endTests()
})

describe('content blocks removal tests', () => {
    it('teacher can remove content block from info page view', () => {
        logInAsUser("username", "password1234")
        createCourseAsUser("courses unique name", "username")
        
        cy.contains("dashboard").click()
        cy.contains("See Teachers Course Page").click()
        createInfoPage("test-url")
        cy.contains("courses info pages").parent().contains("test-url").click()
        createContentBlock("this is a sample content block")
        cy.get('div[class*="contentBlock:"]').contains("edit").click()
        cy.intercept("POST", "http://localhost:4000/", (request) => {
            if(request.body.query.includes('removeContentBlockFromInfoPage'))
            {
                request.alias = "removeContentBlock"
            }
        })
        cy.get('div[class*="contentBlock:"]').contains("delete").click()
        cy.wait("@removeContentBlock").then((communication) => {
            const variables = communication.request.body.variables
            expect(variables.courseUniqueName).to.equal("courses unique name")
        })

        cy.get('p').contains("this is a sample content block").should('not.exist')
    })
    it('student can not see remove content block button from info page view', () => {
        logInAsUser("username", "password1234")
        createCourseAsUser("courses unique name", "username")
        
        cy.contains("dashboard").click()
        cy.contains("See Teachers Course Page").click()
        createInfoPage("test-url")
        cy.contains("courses info pages").parent().contains("test-url").click()
        createContentBlock("this is a sample content block")

        cy.contains("Log Out").click()
        logInAsUser("second username", "password1234")
        joinCourseAsUser("courses unique name", "second username")
        visitCoursePageAsStudentFromDashboard("courses unique name")
        cy.contains("courses info pages").parent().contains("test-url").click()
        cy.get('div[class*="contentBlock:"]').contains("edit").should('not.exist')
        cy.get('div[class*="contentBlock:"]').contains("delete").should('not.exist')
       
    })
})
