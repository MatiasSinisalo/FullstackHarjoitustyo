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
    cy.wait(100)
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
    cy.wait(100)
}

export {prepareTests, logInAsUser, createCourseAsUser, endTests}