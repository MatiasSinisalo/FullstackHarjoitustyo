import { prepareTests, endTests, logInAsUser, createCourseAsUser, joinCourseAsUser, createInfoPage, visitCoursePageAsStudentFromDashboard, createContentBlock } from "./helperFunctions.cy"


beforeEach(function () {
    prepareTests()
})

after(function (){
    endTests()
})

describe('content blocks removal tests', () => {
    it('teacher can edit content block from info page view', () => {
        logInAsUser("username", "password1234")
        createCourseAsUser("courses unique name", "username")
        
        cy.contains("dashboard").click()
        cy.contains("See Teachers Course Page").click()
        createInfoPage("test-url")
        cy.contains("courses info pages").parent().contains("test-url").click()
        const originalContent = "this is a sample content block"
        createContentBlock(originalContent)
        cy.get('div[class*="contentBlock:"]').contains("edit").click()
        
        const modifiedContent = "this is modified content"
        cy.get('div[class*="contentBlock:"]').contains("this is a sample content block").clear().type(modifiedContent)
        cy.intercept("POST", "http://localhost:4000/", (request) => {
            if(request.body.query.includes('modifyContentBlock'))
            {
                request.alias = "modifyContentBlock"
            }
        })
        cy.get('div[class*="contentBlock:"]').contains("save").click()
        cy.wait("@modifyContentBlock").then((communication) => {
            const variables = communication.request.body.variables
            expect(variables.courseUniqueName).to.equal("courses unique name")
            expect(variables.content).to.equal(modifiedContent)
        })
        cy.get('div[class*="contentBlock:"]').contains("cancel").click()
        cy.get('p').contains(originalContent).should('not.exist')
        cy.get('p').contains(modifiedContent)
    })
})
