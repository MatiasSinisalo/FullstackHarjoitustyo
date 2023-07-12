import { logInAsUser, createCourseAsUser, prepareTests, endTests, joinCourseAsUser, createTaskOnCourseAsUser, tomorrow } from './helperFunctions.cy'

beforeEach(function () {
    prepareTests()
})

after(function(){
    endTests()
})

const visitCalendar = () => {
    cy.get('[class*="navbar"]').contains("Calendar").click()
}

describe('Calendar tests', () => {
    const courseUniqueName = "course-uniqueName"
    const task1Description = "this is a task"  

    const secondCourseUniqueName = "second-course-uniqueName"
    const task2Description = "this is the second task"

    beforeEach(function () {
        logInAsUser("username", "password1234")       
        createCourseAsUser(courseUniqueName, "name")
        createTaskOnCourseAsUser(courseUniqueName, task1Description, tomorrow(), 5);

        cy.contains("Dashboard").click()

        createCourseAsUser(secondCourseUniqueName, "name")
        createTaskOnCourseAsUser(secondCourseUniqueName, task2Description, tomorrow(), 5);

        cy.contains("Log Out").click()
    })
    
    it('Calendar displays tasks from all courses that the user participates in', () => {
        logInAsUser("second username", "password1234")
        joinCourseAsUser(courseUniqueName, "second username")
        joinCourseAsUser(secondCourseUniqueName, "second username")

        visitCalendar()

        cy.get('div[class*="day"]').contains(`tasks: 1, ${courseUniqueName}`)
        cy.get('div[class*="day"]').contains(`tasks: 1, ${secondCourseUniqueName}`)
    })

    it('user can navigate from Calendar tasks popup to task view', () => {
        logInAsUser("second username", "password1234")
        joinCourseAsUser(courseUniqueName, "second username")

        visitCalendar()

        cy.get('div[class*="day"]').contains(`tasks: 1, ${courseUniqueName}`).click()
        cy.contains(task1Description).click()
        
        cy.contains(task1Description)
        cy.contains(courseUniqueName)
        cy.contains('max grade')
        cy.contains('create new solution')
    })
})