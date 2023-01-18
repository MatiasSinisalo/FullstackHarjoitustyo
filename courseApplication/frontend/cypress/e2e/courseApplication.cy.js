describe('general app tests', function (){
    it('main page can be visited', function (){
        cy.visit('http://localhost:3000')
        cy.contains('Log in page')
    })
})