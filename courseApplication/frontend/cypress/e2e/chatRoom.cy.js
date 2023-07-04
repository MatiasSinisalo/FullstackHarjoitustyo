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
    cy.contains("create new chatroom").click()
}

const createChatRoom = (name) => {
    visitCreateChatRoom()

    cy.get('input[name="chatRoomName"]').type(name)
    cy.get('input[value="create new chatroom"]').click()
}

const catchRequestAs = (requestQueryContains) => {
    cy.intercept('POST', 'http://localhost:4000/', (request) => {
        if(request.body.query.includes(requestQueryContains))
        {
            request.alias = requestQueryContains
        }
    })
}

const visitChatRoom = (name, isTeacher=true) => {
    cy.contains("dashboard").click()
    if(isTeacher)
    {
        cy.contains("See Teachers Course Page").click()
    }
    else{
        cy.contains("See Course Page").click()
    }
    cy.get("a").contains(name).click()
}

const addUserToChatRoom = (username) => {
    cy.get('input[name="username"]').type(username)
    cy.get('input[value="add user"]').click()
}

const otherUserJoinsCourse = () => {
    cy.contains("Log Out").click()
    logInAsUser("second username", "password1234")
    joinCourseAsUser("courseUniqueName", "second username")
    cy.contains("Log Out").click()
    logInAsUser("username", "password1234")
}

const sendMessage = (content) => {
    cy.get('input[name="content"]').type(content)
    cy.get('input[value="send"]').click()
}
describe('chatroom tests', () => {
    it('room can be created by teacher', function() {
        logInAsUser("username", "password1234")
        createCourseAsUser("courseUniqueName", "name")
        
        visitCreateChatRoom()

        catchRequestAs("CreateChatRoom")
        cy.get('input[name="chatRoomName"]').type("chatRoomName")
        cy.get('input[value="create new chatroom"]').click()
        cy.wait("@CreateChatRoom").then((comms) => {
            const variables = comms.request.body.variables
            expect(variables.courseUniqueName).to.equal("courseUniqueName")
        })

        cy.get("a").contains("chatRoomName").click()
        cy.get("h1").contains("chatRoomName")
    })
    it('room can be removed by teacher', function() {
        logInAsUser("username", "password1234")
        createCourseAsUser("courseUniqueName", "name")
        
        createChatRoom("chatRoomName")
        cy.visit('http://localhost:3000/dashboard', {onBeforeLoad(win) {
            cy.stub(win, 'prompt').returns("chatRoomName")
        }})
        visitChatRoom("chatRoomName")
        catchRequestAs("removeChatRoom")
        cy.get("button").contains("remove chatRoom").click()
        cy.wait("@removeChatRoom").then((comms) => {
            const variables = comms.request.body.variables
            expect(variables.courseUniqueName).to.equal("courseUniqueName")
        })

        cy.contains("it seems this chatRoom does not exist, click here to go to course page")

        cy.reload()
        logInAsUser("username", "password1234")
        cy.contains("dashboard").click()
        cy.contains("See Teachers Course Page").click()
        cy.get("a").contains("chatRoomName").should("not.exist")
    })
    it('teacher can add student to room', function() {
        logInAsUser("username", "password1234")
        createCourseAsUser("courseUniqueName", "name")
        
        visitCreateChatRoom()
        createChatRoom("chatRoomName")
        visitChatRoom("chatRoomName")
        
        otherUserJoinsCourse()

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

    it('teacher can remove student from room', function() {
        logInAsUser("username", "password1234")
        createCourseAsUser("courseUniqueName", "name")
        
        visitCreateChatRoom()
        createChatRoom("chatRoomName")
        visitChatRoom("chatRoomName")
        
        otherUserJoinsCourse()

        cy.visit('http://localhost:3000/dashboard', {onBeforeLoad(win) {
            cy.stub(win, 'prompt').returns("second username")
        }})
        visitChatRoom("chatRoomName")
        addUserToChatRoom("second username")
        
        catchRequestAs("removeUserFromChatRoom")
        const userRow = cy.get("table").contains("second username").parent()
        userRow.contains("remove").click()
        cy.wait("@removeUserFromChatRoom").then((comms) => {
            const variables = comms.request.body.variables
            expect(variables.courseUniqueName).to.equal("courseUniqueName")
            expect(variables.username).to.equal("second username")
        })

        cy.get("table").contains("second username").should("not.exist")
    })

    it('teacher can send messages to room', function() {
        logInAsUser("username", "password1234")
        createCourseAsUser("courseUniqueName", "name")
        
        visitCreateChatRoom()
        createChatRoom("chatRoomName")
        visitChatRoom("chatRoomName")
        
        catchRequestAs("createMessage")
        sendMessage("greetings!")
        cy.wait("@createMessage").then((comms) => {
            const variables = comms.request.body.variables
            expect(variables.courseUniqueName).to.equal("courseUniqueName")
            expect(variables.content).to.equal("greetings!")
        })

        cy.get("p").contains("greetings! by: username")

    })

    it('user can send messages to room', function() {
        logInAsUser("username", "password1234")
        createCourseAsUser("courseUniqueName", "name")
        otherUserJoinsCourse()

        visitCreateChatRoom()
        createChatRoom("chatRoomName")
        visitChatRoom("chatRoomName")
        
        addUserToChatRoom("second username")

        cy.contains("Log Out").click()
        logInAsUser("second username", "password1234")
        visitChatRoom("chatRoomName", false)

        catchRequestAs("createMessage")
        sendMessage("greetings!")
        cy.wait("@createMessage").then((comms) => {
            const variables = comms.request.body.variables
            expect(variables.courseUniqueName).to.equal("courseUniqueName")
            expect(variables.content).to.equal("greetings!")
        })

        cy.get("p").contains("greetings! by: second username")
    })

    
    it('chatroom messages are seen by participants', function() {
        logInAsUser("username", "password1234")
        createCourseAsUser("courseUniqueName", "name")
        otherUserJoinsCourse()

        visitCreateChatRoom()
        createChatRoom("chatRoomName")
        visitChatRoom("chatRoomName")
        
        addUserToChatRoom("second username")

        visitChatRoom("chatRoomName")
        catchRequestAs("createMessage")
        sendMessage("greetings!")

        cy.contains("Log Out").click()
        logInAsUser("second username", "password1234")
        visitChatRoom("chatRoomName", false)
        cy.get("p").contains("greetings! by: username")
        sendMessage("good day")

        cy.contains("Log Out").click()
        logInAsUser("username", "password1234")
        visitChatRoom("chatRoomName")
        cy.get("p").contains("greetings! by: username")
        cy.get("p").contains("good day by: second username")
    })
    
})

