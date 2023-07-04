import { visitInfoPage, prepareTests, endTests, logInAsUser, createCourseAsUser, joinCourseAsUser, createInfoPage, visitCoursePageAsStudentFromDashboard, createContentBlock } from "./helperFunctions.cy"


beforeEach(function () {
    prepareTests()
})

after(function (){
    endTests()
})




describe('Content block creation tests', () => {
    it('user can create an content block on info page', () => {
        logInAsUser("username", "password1234")
        createCourseAsUser("courses-uniquename", "course name")
        cy.contains("dashboard").click()
        cy.contains("See Teachers Course Page").click()
        const pageurl = "this-is-a-test"
        createInfoPage(pageurl)
        visitInfoPage(pageurl)
        cy.get(`h1`).contains(pageurl)

        cy.get(`textarea[name="newBlockContent"]`).type("this is a new block")
        cy.intercept('POST', 'http://localhost:4000/', (request) => {
            if(request.body.query.includes('addContentBlockToInfoPage'))
            {
                request.alias = "addContentBlock"
            }
        })
        cy.get(`button`).contains("new block").click()
        cy.wait("@addContentBlock").then((communication) => {
            const variables = communication.request.body.variables
            expect(variables.content).to.equal("this is a new block")
            expect(variables.courseUniqueName).to.equal("courses-uniquename")
        })

        cy.get('p').contains("this is a new block")
    })

    it('student can see an content block on info page', () => {
        logInAsUser("username", "password1234")
        createCourseAsUser("courses-uniquename", "course name")
        cy.contains("dashboard").click()
        cy.contains("See Teachers Course Page").click()
        const pageurl = "this-is-a-test"
        createInfoPage(pageurl)
        visitInfoPage(pageurl)
        cy.get(`h1`).contains(pageurl)
        const content = "this is a content block"
        createContentBlock(content)
        cy.contains("Log Out").click()

        logInAsUser("second username", "password1234")
        joinCourseAsUser("courses-uniquename", "second username")
        visitCoursePageAsStudentFromDashboard("courses-uniquename")
        visitInfoPage(pageurl)
        cy.get(`h1`).contains(pageurl)
        cy.get('p').contains(content)
    })

})