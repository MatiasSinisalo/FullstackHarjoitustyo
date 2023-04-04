import { prepareTests, endTests, logInAsUser} from "./helperFunctions.cy";

before(function(){
    prepareTests()
})

after(function(){
    endTests()
})


describe('Create User Tests', () => {
    it('customer can create a new user and log in', () => {
        cy.visit('localhost:3000')
        const createUserPromt = cy.contains("dont have an account? create one here")
        const createUserLink = createUserPromt.contains("here")
        createUserLink.click()
        cy.wait(100)
        
        cy.contains("Create a new account")
        
        const usernameField = cy.get("[name = username]")
        const nameField = cy.get("[name = name]")
        const passwordField = cy.get("[name = password]")
        const createNewAccountButton = cy.get('[value="create new account"]')

        const user = {
            username: "user creation test username",
            name: "user creation test users name",
            password: "superSecurePassword54321"
        }

        usernameField.type(user.username)
        nameField.type(user.name)
        passwordField.type(user.password)
        
        cy.intercept('POST', 'http://localhost:4000').as('serverResponse')
        createNewAccountButton.click()
        cy.wait('@serverResponse').then((communication) => {
            const receivedResponse = communication.response.body.data.createUser
            expect(receivedResponse.username).to.equal(user.username)
            expect(receivedResponse.name).to.equal(user.name)
        })

        logInAsUser(user.username, user.password)


       
    })
})