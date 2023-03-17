import { prepareTests, endTests, logInAsUser, createCourseAsUser} from "./helperFunctions.cy";

before(function(){
    prepareTests()
})

after(function(){
    endTests()
})



describe('task creation on course tests', () => {
    it('user can create a new task on course where the user is a teacher', () => {
        logInAsUser("username", "password1234")
        createCourseAsUser("course created for task testing", "testing for tasks")
        
        cy.contains("dashboard").click()
        cy.wait(100)

        cy.contains("See Teachers Course Page").click()
        cy.wait(100)

        const taskDescriptionField = cy.get('[name="taskDescription"]')
        const taskDeadlineField = cy.get('[name="taskDeadLine"]')
        const taskCreateButton = cy.get('[value="create task"]')

        const today = new Date(Date.now())
        const tomorrow = new Date()
        tomorrow.setDate(today.getDate() + 1)
        const newTask = {
            description: "this is a new task for the course",
            deadline: tomorrow
        }
        const deadlineString = newTask.deadline.toISOString().split('T')[0]
        taskDescriptionField.type(newTask.description)
        taskDeadlineField.type(deadlineString)

        cy.intercept('POST', 'http://localhost:4000').as('serverResponse')
        taskCreateButton.click()
        cy.wait('@serverResponse').then((communication) => {
            const responseData = communication.response.body.data.addTaskToCourse
            const createdTask = responseData.tasks[0]
            expect(createdTask.description).to.equal(newTask.description)
            const savedDeadline =new Date(parseInt(createdTask.deadline)).toISOString().split('T')[0]
            expect(savedDeadline).to.equal(deadlineString)

            const createdTaskId = createdTask.id
            const taskComponent =`[class="task:${createdTaskId}"]`
            cy.get(taskComponent).contains(newTask.description)
            cy.get(taskComponent).contains(`deadline: ${deadlineString}`)
            cy.get(taskComponent).contains(`submit solution`)

        })
    })
})
