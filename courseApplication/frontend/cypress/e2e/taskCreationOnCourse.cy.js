
import { prepareTests, endTests, logInAsUser, createCourseAsUser, createTaskOnCourseAsUser, joinCourseAsUser, visitCoursePageAsStudentFromDashboard, visitTaskView} from "./helperFunctions.cy";

beforeEach(function(){
    prepareTests()
})

after(function(){
    endTests()
})



describe('task creation on course tests', () => {
    it('user can create a new task on course where the user is a teacher', () => {
        logInAsUser("username", "password1234")
        createCourseAsUser("course-created-for-task-testing", "testing for tasks")
        
        cy.contains("dashboard").click()
        cy.wait(100)

        cy.contains("See Teachers Course Page").click()
        cy.contains("teachers view").click()
        cy.contains("create new task").click()

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
            const createdTask = responseData
            expect(createdTask.description).to.equal(newTask.description)
            const savedDeadline =new Date(parseInt(createdTask.deadline)).toISOString().split('T')[0]
            expect(savedDeadline).to.equal(deadlineString)

          

        })
        visitTaskView(newTask.description)
        cy.contains(newTask.description).parent().as("task")
        cy.get("@task").contains(`deadline: ${deadlineString}`)
        cy.get("@task").contains(`create new solution`)

    })

    it('user can create a new task with max grade on course where the user is a teacher', () => {
        logInAsUser("username", "password1234")
        createCourseAsUser("course-created-for-task-testing", "testing for tasks")
        
        cy.contains("dashboard").click()
        cy.wait(100)

        cy.contains("See Teachers Course Page").click()
        cy.contains("teachers view").click()
        cy.contains("create new task").click()

        const taskDescriptionField = cy.get('[name="taskDescription"]')
        const taskDeadlineField = cy.get('[name="taskDeadLine"]')
        const taskMaxGradeField = cy.get('[name="taskMaxGrade"]')
        const taskCreateButton = cy.get('[value="create task"]')

        const today = new Date(Date.now())
        const tomorrow = new Date()
        tomorrow.setDate(today.getDate() + 1)
        const newTask = {
            description: "this is a new task for the course",
            deadline: tomorrow,
            maxGrade: 10
        }
        const deadlineString = newTask.deadline.toISOString().split('T')[0]
        taskDescriptionField.type(newTask.description)
        taskDeadlineField.type(deadlineString)
        taskMaxGradeField.type(newTask.maxGrade)

        cy.intercept('POST', 'http://localhost:4000').as('serverResponse')
        taskCreateButton.click()
        cy.wait('@serverResponse').then((communication) => {
            const responseData = communication.response.body.data.addTaskToCourse
            const createdTask = responseData
            expect(createdTask.description).to.equal(newTask.description)
            expect(createdTask.maxGrade).to.equal(newTask.maxGrade)
            const savedDeadline =new Date(parseInt(createdTask.deadline)).toISOString().split('T')[0]
            expect(savedDeadline).to.equal(deadlineString)

          

        })
        visitTaskView(newTask.description)
        cy.contains(newTask.description).parent().as("task")
        cy.get("@task").contains(`deadline: ${deadlineString}`)
        cy.get("@task").contains(`max grade: ${newTask.maxGrade}`)
        cy.get("@task").contains(`create new solution`)

    })

    it('User can see tasks created on a course', () => {
        logInAsUser("username", "password1234")
        const course = {
            uniqueName: "this-is-a-course-for-testing-task-visibility",
            name:  "name of the course"
        }
        createCourseAsUser(course.uniqueName, course.name)
        cy.wait(500)
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
        cy.contains("tasks").click()
        const taskShowCase = cy.contains(task.description).parent()
        taskShowCase.contains("view").click()

        cy.contains(task.description).parent().as('taskComponent')
        cy.get('@taskComponent').contains(task.description)
        cy.get('@taskComponent').contains(task.deadline.toISOString().split('T')[0])
        cy.get('@taskComponent').contains("create new solution")
        
    })
})
