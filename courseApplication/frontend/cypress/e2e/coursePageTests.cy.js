import { prepareTests, endTests, logInAsUser, createCourseAsUser, joinCourseAsUser } from "./helperFunctions.cy"


beforeEach(function () {
    prepareTests()
 })

describe('course page tests', () => {
    it('user can visit the course page that the user participates in from the course browser', () => {
        logInAsUser("username", "password1234")
        createCourseAsUser("this-course-is-created-by-user-username", "courses name")
        cy.contains("Log Out").click()
        logInAsUser("second username", "password1234")
        joinCourseAsUser("this-course-is-created-by-user-username", "second username");
        cy.contains("See Course Page").click()
        cy.contains("this-course-is-created-by-user-username")
        cy.contains("courses name")
        
    })

    it('user can visit the course page that the user participates in from the dashboard', () => {
        logInAsUser("username", "password1234")
        createCourseAsUser("this-course-is-created-by-user-username", "courses name")
        cy.contains("Log Out").click()
        logInAsUser("second username", "password1234")
        joinCourseAsUser("this-course-is-created-by-user-username", "second username");
        
        cy.contains("Dashboard").click()
        cy.contains("this-course-is-created-by-user-username")
        cy.contains("courses name")
        
        cy.contains("See Course Page").click()

        cy.contains("this-course-is-created-by-user-username")
        cy.contains("courses name")
        
    })

    
 })

after(function (){
    endTests()
})