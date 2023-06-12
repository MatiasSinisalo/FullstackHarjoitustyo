import { logInAsUser, createCourseAsUser, prepareTests, endTests} from "./helperFunctions.cy"

before(function () {
   prepareTests()
})

describe('course joining tests', () => {
    it('user can join and leave a course created by another user', function (){
        logInAsUser("second username", "password1234")
        
        createCourseAsUser("this-course-is-created-by-user-second-username", "courses name")
        cy.visit('http://localhost:3000/CourseBrowser')
        cy.wait(500)
        cy.contains("this-course-is-created-by-user-second-username")
        cy.contains("Log Out").click()
    
        logInAsUser("username", "password1234")
        cy.visit('http://localhost:3000/CourseBrowser', {onBeforeLoad(win) {
            cy.stub(win, 'prompt').returns("username")
        }})
        cy.wait(500)
        const courseShowCase = cy.contains("this-course-is-created-by-user-second-username").parent()
        const joinButton = courseShowCase.contains("button","Join")
       
        cy.intercept('POST', 'http://localhost:4000').as('serverResponse')
        joinButton.click()
        cy.wait('@serverResponse').then((response) => {
            const receivedResponse = response.response.body.data.addStudentToCourse
            expect(receivedResponse.uniqueName).to.equal("this-course-is-created-by-user-second-username")
            expect(receivedResponse.students.find((student) => student.username === "username").username).to.equal("username")
            console.log(response)
        })
       
    
        const leaveButton = courseShowCase.contains("button","Leave course")
        cy.intercept('POST', 'http://localhost:4000').as('serverResponse')
        leaveButton.click()
        cy.wait('@serverResponse').then((response) => {
            const receivedResponse = response.response.body.data.removeStudentFromCourse
            expect(receivedResponse.uniqueName).to.equal("this-course-is-created-by-user-second-username")
            expect(receivedResponse.students.find((student) => student.username === "username")).to.equal(undefined)
            console.log(response)
        })
    
        courseShowCase.contains("button","Join")

        cy.contains("Log Out").click()
    })
})


after(async function () {
   endTests()
})
