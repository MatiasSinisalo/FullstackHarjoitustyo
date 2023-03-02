import { prepareTests, endTests, logInAsUser, createCourseAsUser, joinCourseAsUser } from "./helperFunctions.cy"


beforeEach(function () {
    prepareTests()
 })


describe('teacher page tests', () => {
    it('user can visit the teachers course page from the course browser if the user created is the teacher of the course', () => {
        logInAsUser("username", "password1234")
        createCourseAsUser("this course is created by user username", "courses name")
     
        cy.contains("Courses").click()
        cy.wait(100)

        cy.contains("this course is created by user username")
        cy.contains("courses name")
        
        cy.contains("See Teachers Course Page").click()
        cy.wait(100)

        cy.contains("this course is created by user username")
        cy.contains("courses name")
        cy.contains("this is the teachers course page")
    })

    it('user can visit the teachers course page from the course browser if the user created is the teacher of the course', () => {
        logInAsUser("username", "password1234")
        createCourseAsUser("this course is created by user username", "courses name")
     
        cy.contains("dashboard").click()
        cy.wait(100)

        cy.contains("this course is created by user username")
        cy.contains("courses name")
        
        cy.contains("See Teachers Course Page").click()
        cy.wait(100)

        cy.contains("this course is created by user username")
        cy.contains("courses name")
        cy.contains("this is the teachers course page")
    })
 })

 after(function (){
    endTests()
})