
import { prepareTests, endTests, logInAsUser, createCourseAsUser, createTaskOnCourseAsUser, joinCourseAsUser, visitCoursePageAsStudentFromDashboard, createSubmissionToATask} from "./helperFunctions.cy";

before(function(){
    prepareTests()
})

after(function(){
    endTests()
})



describe('submitting a solution to a task test', () => {
    it('User can submit a solution to a task where the user is a student', () => {
        logInAsUser("username", "password1234")
        const course = {
            uniqueName: "this is a course for testing task visibility",
            name:  "name of the course"
        }
        createCourseAsUser(course.uniqueName, course.name)
        cy.wait(100)

        const today = new Date(Date.now())
        const tomorrow = new Date()
        tomorrow.setDate(today.getDate() + 1)
        const task = {
            description: "description for a task",
            deadline: tomorrow
        }
        createTaskOnCourseAsUser(course.uniqueName, task.description, task.deadline)

        cy.contains("Log Out").click()
        logInAsUser("second username", "password1234")

        joinCourseAsUser(course.uniqueName, "second username")
        visitCoursePageAsStudentFromDashboard(course.uniqueName)

        cy.contains(task.description).parent().as('taskComponent')
        cy.get('@taskComponent').contains(task.description)
        cy.get('@taskComponent').contains(task.deadline.toISOString().split('T')[0])
        cy.get('@taskComponent').contains("submit solution")
        
        const submissionContentField = cy.get('@taskComponent').get('[name="content"]')
        const submissionSubmitButton = cy.get('@taskComponent').get('[value="submit solution"]')
        submissionContentField.type("this is a solution to a task")
        
        cy.intercept('POST', 'http://localhost:4000', (request) => {
            if(request.body.query.includes('addSubmissionToCourseTask'))
            {
                request.alias = "submitSolution"
            }
        }).as("submitSolution")
        submissionSubmitButton.click()
        cy.wait('@submitSolution').then((communication) => {
            const submission = communication.response.body.data.addSubmissionToCourseTask
            console.log(communication)
            expect(submission.content).to.equal("this is a solution to a task")
            expect(submission.submitted).to.equal(true)
        })
       
        cy.get('p').contains("this is a solution to a task")

        
    })
    it('User can submit a solution to a task where the user is a teacher', () => {
        logInAsUser("username", "password1234")
        const course = {
            uniqueName: "this is a course for testing task visibility 2",
            name:  "name of the course"
        }
        createCourseAsUser(course.uniqueName, course.name)
        cy.wait(100)

        const today = new Date(Date.now())
        const tomorrow = new Date()
        tomorrow.setDate(today.getDate() + 1)
        const task = {
            description: "description for a task",
            deadline: tomorrow
        }
        createTaskOnCourseAsUser(course.uniqueName, task.description, task.deadline)
        
        const submissionContentField = cy.get('[name="content"]')
        const submissionSubmitButton = cy.get('[value="submit solution"]')
        const submissionContent = "this is a second solution to a task"
        submissionContentField.type(submissionContent)
        
        cy.intercept('POST', 'http://localhost:4000', (request) => {
            if(request.body.query.includes('addSubmissionToCourseTask'))
            {
                request.alias = "submitSolution"
            }
        }).as("submitSolution")
        submissionSubmitButton.click()
        cy.wait('@submitSolution').then((communication) => {
            const submission = communication.response.body.data.addSubmissionToCourseTask
            console.log(communication)
            expect(submission.content).to.equal(submissionContent)
            expect(submission.submitted).to.equal(true)
        })
       
        cy.get('p').contains(submissionContent)

        
    })
})

describe('submitting solution to a task deadline tests', () => {
    it('if solution is submitted before deadline, no late message is shown', () => {
        logInAsUser("username", "password1234")
        const course = {
            uniqueName: "this is a course for testing deadlines",
            name:  "name of the course"
        }
        createCourseAsUser(course.uniqueName, course.name)
        

        const today = new Date(Date.now())
        const tomorrow = new Date()
        tomorrow.setDate(today.getDate() + 1)
        const task = {
            description: "description for a task",
            deadline: tomorrow
        }
        createTaskOnCourseAsUser(course.uniqueName, task.description, task.deadline)
        createSubmissionToATask("description for a task", "this is an answer")
        cy.get(`[class*="lateMessage"]`).should('not.exist')
        cy.contains("Log Out").click()
    })

    it('if solution is submitted after deadline, late message is shown', () => {
        logInAsUser("username", "password1234")
        const course = {
            uniqueName: "this is a course for testing deadlines2",
            name:  "name of the course"
        }
        createCourseAsUser(course.uniqueName, course.name)
        

        const today = new Date(Date.now())
        const yesterday = new Date()
        yesterday.setDate(today.getDate() - 1)
        const task = {
            description: "description for a task",
            deadline: yesterday
        }
        createTaskOnCourseAsUser(course.uniqueName, task.description, task.deadline)
        createSubmissionToATask("description for a task", "this is an answer")
        cy.get(`[class*="lateMessage"]`).contains("this submission was returned late")
    })
})
