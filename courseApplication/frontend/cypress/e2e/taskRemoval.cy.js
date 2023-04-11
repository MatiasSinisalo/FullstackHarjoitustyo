import { prepareTests, endTests, logInAsUser, createCourseAsUser, joinCourseAsUser, createTaskOnCourseAsUser } from "./helperFunctions.cy"


beforeEach(function () {
    prepareTests()
 })

 after(function (){
    endTests()
})

describe('task removal tests', () => {
    it('teacher can remove created task from a course', ()=> {
        logInAsUser("username", "password1234")
        const course = {
            uniqueName: "this is a course for testing task removal",
            name:  "name of the course"
        }
        createCourseAsUser(course.uniqueName, course.name)
       
    
        const today = new Date(Date.now())
        const tomorrow = new Date()
        tomorrow.setDate(today.getDate() + 1)
        const task = {
            description: "description for a removed task",
            deadline: tomorrow
        }
        createTaskOnCourseAsUser(course.uniqueName, task.description, task.deadline)
    
        const createdTask = cy.get(`[class*="taskListing"]`).contains("description for a removed task").parent()
        const removeButton =  createdTask.get(`button`).contains("remove task")
    
        cy.intercept('POST', 'http://localhost:4000/', (request) => {
            if(request.body.query.includes('removeTaskFromCourse'))
            {
                request.alias = "removeTask"
            }
        })
        removeButton.click()
        cy.wait("@removeTask").then((communication) => {
            const requestVariables = communication.request.body.variables
            expect(requestVariables.courseUniqueName).to.equal("this is a course for testing task removal")
        })

        cy.get('[class*="Task:"]').should('not.exist');
        cy.reload(true)
        logInAsUser("username", "password1234")
        cy.contains("See Teachers Course Page").click()
        cy.get('[class*="Task:"]').should('not.exist');
        
    })
})
