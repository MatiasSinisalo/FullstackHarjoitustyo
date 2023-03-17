const prepareTests  = () => {
    cy.request({
        method: 'POST',
        url: 'http://localhost:4000',
        body: {
            query:`
            mutation Mutation {
                reset
            }`,
            operationName: 'Mutation'
        }
    })

    

    cy.request({
        method: 'POST',
        url: 'http://localhost:4000',
        body: {
            query:`
            mutation Mutation($username: String!, $name: String!, $password: String!) {
              createUser(username: $username, name: $name, password: $password) {
                name
                username
              }
            }
            `,
            variables: {username: "username", name: "users name", password: "password1234"},
            operationName: 'Mutation'
        }
    })


    cy.request({
        method: 'POST',
        url: 'http://localhost:4000',
        body: {
            query:`
            mutation Mutation($username: String!, $name: String!, $password: String!) {
              createUser(username: $username, name: $name, password: $password) {
                name
                username
              }
            }
            `,
            variables: {username: "second username", name: "second users name", password: "password1234"},
            operationName: 'Mutation'
        }
    })
}

const endTests = async () => {
    localStorage.removeItem('courseApplicationUserToken')
    await cy.request({
        method: 'POST',
        url: 'http://localhost:4000',
        body: {
            query:`
            mutation Mutation {
                reset
            }`,
            operationName: 'Mutation'
        }
    })
}

const logInAsUser = (username, password) => {
    cy.visit('http://localhost:3000')
    const usernameField = cy.get('input[name="username"]')
    const passwordField = cy.get('input[name="password"]')
    const submitButton = cy.get('input[type="submit"]')

    usernameField.click().type(username)
    cy.wait(100)
    passwordField.click().type(password)
    cy.wait(100)
    
    submitButton.click()

    cy.wait(300)
    cy.contains(username)
    cy.contains('dashboard page')
   
    cy.wait(100)
}

const createCourseAsUser = (courseUniqueName, courseName) => {
    cy.contains('Create new Course').click()
    const courseUniqueNameField = cy.get('input[name=courseUniqueName]')
    const courseNameField = cy.get('input[name=courseName]')
    const courseSubmitButton = cy.get('input[type="submit"]')
   
    courseUniqueNameField.type(courseUniqueName)
    cy.wait(100)

    courseNameField.type(courseName)
    cy.wait(100)

    courseSubmitButton.click()
}

const createTaskOnCourseAsUser = (courseUniqueName, description, deadline) => {
    cy.contains("dashboard").click()
    cy.wait(100)

    const course = cy.contains(courseUniqueName).parent()
    course.contains("See Teachers Course Page").click()
    cy.wait(100)

    const taskDescriptionField = cy.get('[name="taskDescription"]')
    const taskDeadlineField = cy.get('[name="taskDeadLine"]')
    const taskCreateButton = cy.get('[value="create task"]')

    const today = new Date(Date.now())
    const tomorrow = new Date()
    tomorrow.setDate(today.getDate() + 1)
    const newTask = {
        description: description,
        deadline: deadline
    }
    const deadlineString = newTask.deadline.toISOString().split('T')[0]
    taskDescriptionField.type(newTask.description)
    taskDeadlineField.type(deadlineString)
    
    taskCreateButton.click()
    cy.wait(300)
}


const joinCourseAsUser= (courseUniqueName, usernameToJoinTheCourse) => {
    cy.visit('http://localhost:3000/CourseBrowser')
    cy.wait(500)
    const courseShowCase = cy.contains(courseUniqueName).parent()
    const joinButton = courseShowCase.contains("button","Join")
   
    cy.intercept('POST', 'http://localhost:4000').as('serverResponse')
    joinButton.click()
    cy.wait('@serverResponse').then((response) => {
        const receivedResponse = response.response.body.data.addStudentToCourse
        expect(receivedResponse.uniqueName).to.equal(courseUniqueName)
        expect(receivedResponse.students.find((student) => student.username === usernameToJoinTheCourse).username).to.equal(usernameToJoinTheCourse)
        console.log(response)
    })
} 

const visitCoursePageAsStudentFromDashboard = (courseUniqueName) => {
    cy.contains("dashboard").click()
    cy.wait(100)
    const course = cy.contains(courseUniqueName).parent()
    course.contains("See Course Page").click()
    cy.wait(100)
}

export {prepareTests, logInAsUser, createCourseAsUser, createTaskOnCourseAsUser,joinCourseAsUser, endTests, visitCoursePageAsStudentFromDashboard}