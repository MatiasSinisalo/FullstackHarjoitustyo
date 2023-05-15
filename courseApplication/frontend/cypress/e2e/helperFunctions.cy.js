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
    
    passwordField.click().type(password)
  
    
    submitButton.click()

    
    cy.contains(username)
    cy.contains('dashboard page')
   
    
}

const createCourseAsUser = (courseUniqueName, courseName) => {
    cy.contains('Create new Course').click()
    const courseUniqueNameField = cy.get('input[name=courseUniqueName]')
    const courseNameField = cy.get('input[name=courseName]')
    const courseSubmitButton = cy.get('input[type="submit"]')
   
    courseUniqueNameField.type(courseUniqueName)
   

    courseNameField.type(courseName)
   

    courseSubmitButton.click()
}

const createTaskOnCourseAsUser = (courseUniqueName, description, deadline) => {
    cy.contains("dashboard").click()
   

    const course = cy.get('div[class*="course:"]').contains(`${courseUniqueName}`).parent()
    course.contains("See Teachers Course Page").click()
  

    const taskDescriptionField = cy.get('[name="taskDescription"]')
    const taskDeadlineField = cy.get('[name="taskDeadLine"]')
    const taskCreateButton = cy.get('[value="create task"]')

    const newTask = {
        description: description,
        deadline: deadline
    }
    const deadlineString = newTask.deadline.toISOString().split('T')[0]
    taskDescriptionField.type(newTask.description)
    taskDeadlineField.type(deadlineString)
    
    taskCreateButton.click()
   
}


const joinCourseAsUser= (courseUniqueName, usernameToJoinTheCourse) => {
    cy.visit('http://localhost:3000/CourseBrowser')
    
    const courseShowCase = cy.get('div[class*="course:"]').contains(`${courseUniqueName}`).parent()
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
    
    const course = cy.contains(courseUniqueName).parent()
    course.contains("See Course Page").click()
    
}

const createSubmissionToATask = (taskDescription, content, isLate=false) => {
    if(isLate){
        cy.get(`[class*="pastTaskButton"]`).click()
    }
    else{
        cy.get(`[class*="futureTaskButton"]`).click()
    }

    cy.contains(taskDescription).parent().as('taskComponent')
    const submissionContentField = cy.get('@taskComponent').get('[name="content"]')
    const submissionSubmitButton = cy.get('@taskComponent').get('[value="submit solution"]')
    submissionContentField.type(content)
    submissionSubmitButton.click()
}

const tomorrow = () => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow
}
export {prepareTests, logInAsUser, createCourseAsUser, createTaskOnCourseAsUser,joinCourseAsUser, endTests, visitCoursePageAsStudentFromDashboard, createSubmissionToATask, tomorrow}