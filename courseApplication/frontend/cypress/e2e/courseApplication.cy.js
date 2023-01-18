
before(async function () {
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
})

after(async function () {
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
})

describe('general app tests', function (){
    it('main page can be visited', function (){
        cy.visit('http://localhost:3000')
        cy.contains('Log in page')
    })
})