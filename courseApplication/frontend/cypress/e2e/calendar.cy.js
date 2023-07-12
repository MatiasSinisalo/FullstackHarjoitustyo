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

    it('Calendar displays tasks from all courses that the user participates in', () => {
        logInAsUser("username", "password1234")

        const courseUniqueName = "course-uniqueName"
        const task1Description = "this is a task"  
        createCourseAsUser(courseUniqueName, "name")
        createTaskOnCourseAsUser(courseUniqueName, task1Description, tomorrow(), 5);

        cy.contains("dashboard").click()

        const secondCourseUniqueName = "second-course-uniqueName"
        const task2Description = "this is the second task"
        createCourseAsUser(secondCourseUniqueName, "name")
        createTaskOnCourseAsUser(secondCourseUniqueName, task2Description, tomorrow(), 5);

        cy.contains("Log Out").click()
        logInAsUser("second username", "password1234")
        joinCourseAsUser(courseUniqueName, "second username")
        joinCourseAsUser(secondCourseUniqueName, "second username")

        visitCalendar()

        cy.get('div[class*="day"]').contains(`tasks: 1, ${courseUniqueName}`)
        cy.get('div[class*="day"]').contains(`tasks: 1, ${secondCourseUniqueName}`)
    })
})