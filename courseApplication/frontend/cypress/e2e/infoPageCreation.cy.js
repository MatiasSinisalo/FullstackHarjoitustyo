import { prepareTests, endTests, logInAsUser, createCourseAsUser, joinCourseAsUser, createInfoPage, visitCoursePageAsStudentFromDashboard } from "./helperFunctions.cy"


beforeEach(function () {
    prepareTests()
})

after(function (){
    endTests()
})


describe('Info page creation tests', () => {
    it('user can create an info page', () => {
        logInAsUser("username", "password1234")
        createCourseAsUser("courses uniquename", "course name")
        cy.contains("dashboard").click()
        cy.contains("See Teachers Course Page").click()
        cy.contains("create new info page").click()
        
        const pageurl = "this-is-a-info-page-1"

        cy.get(`input[name="locationUrl"]`).type(pageurl)
        cy.intercept('POST', 'http://localhost:4000/', (request) => {
            if(request.body.query.includes('addInfoPageToCourse'))
            {
                request.alias = "addInfoPage"
            }
        })
        cy.get(`input[value="create new info page"]`).click() 
        cy.wait("@addInfoPage").then((communication) => {
            const createInfoPageArgs = communication.request.body.variables
            const expectedArgs = {courseUniqueName: "courses uniquename", locationUrl: pageurl}
            expect(createInfoPageArgs).to.eql(expectedArgs)
        })
       
        cy.contains("courses info pages").parent().contains(pageurl).click()
        cy.get(`h1`).contains(pageurl)
    })

    it('student can visit created info page', () => {
        logInAsUser("username", "password1234")
        createCourseAsUser("courses uniquename", "course name")
        cy.contains("dashboard").click()
        cy.contains("See Teachers Course Page").click()
        const pageurl = "this-is-a-info-page-1"
        createInfoPage(pageurl)
       
        cy.contains("Log Out").click()
        logInAsUser("second username", "password1234")
        joinCourseAsUser("courses uniquename", "second username")
        visitCoursePageAsStudentFromDashboard("courses uniquename")
        cy.contains("courses info pages").parent().contains(pageurl).click()
        cy.get(`h1`).contains(pageurl)
    })
})