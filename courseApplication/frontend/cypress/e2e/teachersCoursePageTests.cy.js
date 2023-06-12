import { prepareTests, endTests, logInAsUser, createCourseAsUser, joinCourseAsUser } from "./helperFunctions.cy"


beforeEach(function () {
    prepareTests()
 })


describe('teacher page tests', () => {
    it('user can visit the teachers course page from the course browser if the user created is the teacher of the course', () => {
        logInAsUser("username", "password1234")
        createCourseAsUser("this-course-is-created-by-user-username", "courses name")
     
        cy.contains("Courses").click()
        cy.wait(100)

        cy.contains("this-course-is-created-by-user-username")
        cy.contains("courses name")
        
        cy.contains("See Teachers Course Page").click()
        cy.wait(100)

        cy.contains("this-course-is-created-by-user-username")
        cy.contains("courses name")
        cy.contains("teachers view").click()
        cy.contains("this is the teachers view")
    })

    it('user can visit the teachers course page from the course dashboard if the user created is the teacher of the course', () => {
        logInAsUser("username", "password1234")
        createCourseAsUser("this-course-is-created-by-user-username", "courses name")
     
        cy.contains("dashboard").click()
        
        cy.contains("this-course-is-created-by-user-username")
        cy.contains("courses name")
        
        cy.contains("See Teachers Course Page").click()
        cy.contains("this-course-is-created-by-user-username")
        cy.contains("courses name")
        cy.contains("teachers view")
    })

    it('user can remove a course from the teachers course page', () => {
        
        logInAsUser("username", "password1234")
        createCourseAsUser("this-course-is-created-by-user-username", "courses name")
        
        cy.contains("Courses").click()
        
        //https://docs.cypress.io/api/commands/stub
        cy.visit('http://localhost:3000/dashboard/', {onBeforeLoad(win) {
            cy.stub(win, 'prompt').returns("this-course-is-created-by-user-username")
        }})

        cy.contains("this-course-is-created-by-user-username")
        cy.contains("courses name")
        
        cy.contains("See Teachers Course Page").click()
      
        cy.contains("this-course-is-created-by-user-username")
        cy.contains("courses name")
        cy.contains("teachers view").click()
     
        cy.intercept('POST', 'http://localhost:4000/', (request) => {
            if(request.body.query.includes('removeCourse'))
            {
                request.alias = "removeCourse"
            }
        })
       
        cy.get('[class="removeCourseButton"]').click()
        cy.wait('@removeCourse').then((cummunication) => {
            const correctCourseRemoved = cummunication.request.body.variables
            expect(correctCourseRemoved.uniqueName).to.equal("this-course-is-created-by-user-username")
        })
        cy.contains('courses')
        cy.contains("this-course-is-created-by-user-username").should('not.exist')
    })

    it('user cant remove a course if the user types the name of the course wrong to the promt', () => {
        
        logInAsUser("username", "password1234")
        createCourseAsUser("this-course-is-created-by-user-username", "courses name")
        
        cy.contains("Courses").click()
        
        //https://docs.cypress.io/api/commands/stub
        cy.visit('http://localhost:3000/dashboard/', {onBeforeLoad(win) {
            cy.stub(win, 'prompt').returns("incorrectly typed ")
        }})

        cy.contains("this-course-is-created-by-user-username")
        cy.contains("courses name")
        
        cy.contains("See Teachers Course Page").click()
      
        cy.contains("this-course-is-created-by-user-username")
        cy.contains("courses name")
        
        cy.contains("teachers view").click()
      

        cy.get('[class="removeCourseButton"]').click()
       
        cy.contains("this-course-is-created-by-user-username")
        cy.contains("courses name")
    })
 })

 after(function (){
    endTests()
})