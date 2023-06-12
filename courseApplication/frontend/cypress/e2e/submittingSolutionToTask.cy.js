
import { prepareTests, endTests, logInAsUser, createCourseAsUser, createTaskOnCourseAsUser, joinCourseAsUser, visitCoursePageAsStudentFromDashboard, createSubmissionToATask, visitTaskView} from "./helperFunctions.cy";

beforeEach(function(){
    prepareTests()
})

after(function(){
    endTests()
})



describe('submitting a solution to a task test', () => {
    it('User can submit a solution to a task where the user is a student', () => {
        logInAsUser("username", "password1234")
        const course = {
            uniqueName: "this-is-a-course-for-testing-task-visibility",
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
        
        visitTaskView(task.description)
       
        cy.contains(task.description).parent().as('taskComponent')
        cy.get('@taskComponent').contains(task.description)
        cy.get('@taskComponent').contains(task.deadline.toISOString().split('T')[0])
        cy.get('@taskComponent').contains("create new solution").click()
        
        cy.get('[class*="submissionShowCase:"]').contains("view").click()

        const submissionContentField = cy.get('[class*="submission:"]').get('[name="content"]')
        const submissionSubmitButton = cy.get('[class*="submission:"]').contains('return task')
        submissionContentField.type("this is a solution to a task")
        
        cy.intercept('POST', 'http://localhost:4000', (request) => {
            if(request.body.query.includes('modifySubmission'))
            {
                request.alias = "submitSolution"
            }
        }).as("submitSolution")
        submissionSubmitButton.click()
        cy.wait('@submitSolution').then((communication) => {
            const submission = communication.response.body.data.modifySubmission
            console.log(communication)
            expect(submission.content).to.equal("this is a solution to a task")
            expect(submission.submitted).to.equal(true)
        })
       
        cy.get('[name="content"]').contains("this is a solution to a task")

        
    })
    it('User can submit a solution to a task where the user is a teacher', () => {
        logInAsUser("username", "password1234")
        const course = {
            uniqueName: "this-is-a-course-for-testing-task-visibility-2",
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

        visitTaskView(task.description)
        cy.contains("create new solution").click()
        cy.get('[class*="submissionShowCase:"]').contains("view").click()
        const submissionContentField = cy.get('[name="content"]')
        const submissionSubmitButton = cy.contains('return task')
        const submissionContent = "this is a second solution to a task"
        submissionContentField.type(submissionContent)
        
        cy.intercept('POST', 'http://localhost:4000', (request) => {
            if(request.body.query.includes('modifySubmission'))
            {
                request.alias = "submitSolution"
            }
        }).as("submitSolution")
        submissionSubmitButton.click()
        cy.wait('@submitSolution').then((communication) => {
            const submission = communication.response.body.data.modifySubmission
            console.log(communication)
            expect(submission.content).to.equal(submissionContent)
            expect(submission.submitted).to.equal(true)
        })
       
        cy.get('[name="content"]').contains("this is a second solution to a task")

        
    })

    it('User can save a solution on a task', () => {
        logInAsUser("username", "password1234")
        const course = {
            uniqueName: "this-is-a-course-for-testing-task-visibility",
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
        
        visitTaskView(task.description)
       

        cy.contains(task.description).parent().as('taskComponent')
        cy.get('@taskComponent').contains(task.description)
        cy.get('@taskComponent').contains(task.deadline.toISOString().split('T')[0])
        cy.get('@taskComponent').contains("create new solution").click()
       
        cy.get('[class*="submissionShowCase:"]').contains("view").click()
        const submissionContentField = cy.get('[class*="submission:"]').get('[name="content"]')
        const submissionSubmitButton = cy.get('[class*="submission:"]').contains('save')
        submissionContentField.type("this is a solution to a task")
        
        cy.intercept('POST', 'http://localhost:4000', (request) => {
            if(request.body.query.includes('modifySubmission'))
            {
                request.alias = "submitSolution"
            }
        }).as("submitSolution")
        submissionSubmitButton.click()
        cy.wait('@submitSolution').then((communication) => {
            const submission = communication.response.body.data.modifySubmission
            console.log(communication)
            expect(submission.content).to.equal("this is a solution to a task")
            expect(submission.submitted).to.equal(false)
        })
       
        cy.get('[name="content"]').contains("this is a solution to a task")

        
    })
})

describe('submitting solution to a task deadline tests', () => {
    it('if solution is submitted before deadline, no late message is shown', () => {
        logInAsUser("username", "password1234")
        const course = {
            uniqueName: "this-is-a-course-for-testing-deadlines",
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
            uniqueName: "this-is-a-course-for-testing-deadlines2",
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
        createSubmissionToATask("description for a task", "this is an answer", true)
        cy.get(`[class*="lateMessage"]`).contains("this submission was returned late")
    })
})
