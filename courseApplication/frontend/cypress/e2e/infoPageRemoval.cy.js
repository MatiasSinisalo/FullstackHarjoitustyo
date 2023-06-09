import { prepareTests, endTests, logInAsUser, createCourseAsUser, joinCourseAsUser, createInfoPage } from "./helperFunctions.cy"


beforeEach(function () {
    prepareTests()
})

 after(function (){
    endTests()
})

describe('info page removal tests', () => {
    it('user can remove an info page', () => {
      
        logInAsUser("username", "password1234")
        const url = "this-will-be-removed"
        
        const courseName = "coursesUniqueName"
        createCourseAsUser(courseName, "courses name")
        cy.contains("dashboard").click()
        cy.contains("See Teachers Course Page").click()
        
        createInfoPage(url)
        cy.visit(`http://localhost:3000/course/${courseName}/page/${url}`, {onBeforeLoad(win) {
            cy.stub(win, 'prompt').returns(url)
        }})
       
       
        cy.intercept('POST', 'http://localhost:4000/', (request) => {
            if(request.body.query.includes('removeInfoPageFromCourse'))
            {
                request.alias = "removeInfoPage"
            }
        })
        cy.contains("remove page").click()
        cy.wait("@removeInfoPage").then((communication) => {
            const variables = communication.request.body.variables
            expect(variables.courseUniqueName).to.equal(courseName)
        })
        
        cy.contains("it seems this page does not exist")
    })

    it('student can not see remove info page button', () => {
      
        logInAsUser("username", "password1234")
        const url = "this-will-be-removed"
        
        const courseName = "coursesUniqueName"
        createCourseAsUser(courseName, "courses name")
        cy.contains("dashboard").click()
        cy.contains("See Teachers Course Page").click()
        
        createInfoPage(url)
        cy.contains("Log Out").click()
        logInAsUser("second username", "password1234")
        cy.visit(`http://localhost:3000/course/${courseName}/page/${url}`)
       
        cy.get('h1').contains(url)
        cy.contains("remove page").should("not.exist")
    })

})