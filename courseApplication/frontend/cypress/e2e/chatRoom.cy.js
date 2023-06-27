import { logInAsUser, createCourseAsUser, prepareTests, endTests, joinCourseAsUser } from './helperFunctions.cy'

beforeEach(function () {
    prepareTests()
})

after(function(){
    endTests()
})

const visitCreateChatRoom = () => {
    cy.contains("dashboard").click()
    cy.contains("See Teachers Course Page").click()
    cy.contains("create new chat room").click()
}

const createChatRoom = (name) => {
    visitCreateChatRoom()

    cy.get('input[name="chatRoomName"]').type(name)
    cy.get('input[value="create new chat room"]').click()
}

const catchRequestAs = (requestQueryContains) => {
    cy.intercept('POST', 'http://localhost:4000/', (request) => {
        if(request.body.query.includes(requestQueryContains))
        {
            request.alias = requestQueryContains
        }
    })
}

const visitChatRoom = (name) => {
    cy.contains("dashboard").click()
    cy.contains("See Teachers Course Page").click()
    cy.get("a").contains(name).click()
}

const addUserToChatRoom = (username) => {
    cy.get('input[name="username"]').type(username)
    cy.get('input[value="add user"]').click()
}

describe('chatroom tests', () => {
    it('room can be created by teacher', function() {
        logInAsUser("username", "password1234")
        createCourseAsUser("courseUniqueName", "name")
        
        visitCreateChatRoom()

        catchRequestAs("CreateChatRoom")
        cy.get('input[name="chatRoomName"]').type("chatRoomName")
        cy.get('input[value="create new chat room"]').click()
        cy.wait("@CreateChatRoom").then((comms) => {
            const variables = comms.request.body.variables
            expect(variables.courseUniqueName).to.equal("courseUniqueName")
        })

        cy.get("a").contains("chatRoomName").click()
        cy.get("h1").contains("chatRoomName")
    })
    it('teacher can add student to room', function() {
        logInAsUser("username", "password1234")
        createCourseAsUser("courseUniqueName", "name")
        
        visitCreateChatRoom()
        createChatRoom("chatRoomName")
        visitChatRoom("chatRoomName")
        
        cy.contains("Log Out").click()
        logInAsUser("second username", "password1234")
        joinCourseAsUser("courseUniqueName", "second username")
        cy.contains("Log Out").click()

        logInAsUser("username", "password1234")
        visitChatRoom("chatRoomName")
        cy.get('input[name="username"]').type("second username")
        catchRequestAs("addUserToChatRoom")
        cy.get('input[value="add user"]').click()
        cy.wait("@addUserToChatRoom").then((comms) => {
            const variables = comms.request.body.variables
            expect(variables.courseUniqueName).to.equal("courseUniqueName")
            expect(variables.username).to.equal("second username")
        })

        cy.get("table").contains("second username")
    })

    it('teacher can add remove student from room', function() {
        logInAsUser("username", "password1234")
        createCourseAsUser("courseUniqueName", "name")
        
        visitCreateChatRoom()
        createChatRoom("chatRoomName")
        visitChatRoom("chatRoomName")
        
        cy.contains("Log Out").click()
        logInAsUser("second username", "password1234")
        joinCourseAsUser("courseUniqueName", "second username")
        cy.contains("Log Out").click()

        logInAsUser("username", "password1234")
        visitChatRoom("chatRoomName")
        addUserToChatRoom("second username")
        
        const userRow = cy.get("table").contains("second username").parent()
        userRow.contains("remove").click()
    })
    
})

