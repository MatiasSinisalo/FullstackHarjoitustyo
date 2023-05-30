import { prepareTests, endTests, logInAsUser, createCourseAsUser, createTaskOnCourseAsUser, joinCourseAsUser, visitCoursePageAsStudentFromDashboard, createSubmissionToATask, visitTaskView, tomorrow} from "./helperFunctions.cy";

beforeEach(function(){
    prepareTests()
})

after(function(){
    endTests()
})

describe('grading a submission tests', () => {
    it('teacher can grade an returned submission created by a student', () => {
        logInAsUser("username", "password1234")
        const course = {uniqueName: "courses unique name", name: "course name"}
        createCourseAsUser(course.uniqueName, course.name)
        
        const task = {description: "this is a task for testing grading", deadline: tomorrow()}
        createTaskOnCourseAsUser(course.uniqueName, task.description, task.deadline)
        
        cy.contains("Log Out").click()
        cy.wait(50)
        logInAsUser("second username", "password1234")
        joinCourseAsUser(course.uniqueName, "second username")
        visitCoursePageAsStudentFromDashboard(course.uniqueName)
        visitTaskView(task.description)
        const submission = {content: "this is an answer to a task"}
        createSubmissionToATask(task.description, submission.content, false)
        
        cy.contains("Log Out").click()
        cy.wait(50)
        logInAsUser("username", "password1234")
        
        cy.contains("See Teachers Course Page").click()
        visitTaskView(task.description)

        cy.get(`input[name="points"]`).type("1")

        cy.intercept('POST', 'http://localhost:4000/', (request) => {
            if(request.body.query.includes('gradeSubmission'))
            {
                request.alias = "gradeSubmission"
            }
        })
        cy.get('input[value="submit grade"]').click()
        cy.wait("@gradeSubmission").then((communication) => {
            const variables = communication.request.body.variables
            expect(variables.courseUniqueName).to.equal(course.uniqueName)
            expect(variables.points).to.equal(1)
        })

        cy.contains("this answer got grade: 1")
        const todayString = new Date(Date.now()).toISOString().split("T")[0]
        cy.contains(`date of grading: ${todayString}`)

    })

    it('submission displays points / maxGrade if maxGrade is available', () => {
        logInAsUser("username", "password1234")
        const course = {uniqueName: "courses unique name", name: "course name"}
        createCourseAsUser(course.uniqueName, course.name)
        
        const task = {description: "this is a task for testing grading", deadline: tomorrow()}
        createTaskOnCourseAsUser(course.uniqueName, task.description, task.deadline, 10)
        
        cy.contains("Log Out").click()
        cy.wait(50)
        logInAsUser("second username", "password1234")
        joinCourseAsUser(course.uniqueName, "second username")
        visitCoursePageAsStudentFromDashboard(course.uniqueName)
        visitTaskView(task.description)
        const submission = {content: "this is an answer to a task"}
        createSubmissionToATask(task.description, submission.content, false)
        
        cy.contains("Log Out").click()
        cy.wait(50)
        logInAsUser("username", "password1234")
        
        cy.contains("See Teachers Course Page").click()
        visitTaskView(task.description)

        cy.get(`input[name="points"]`).type("5")
        cy.get('input[value="submit grade"]').click()
        
        cy.contains('this answer got grade: 5 /10')

    })
})