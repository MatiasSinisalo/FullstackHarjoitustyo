
//source for testing an application that uses graphQL:  https://www.apollographql.com/docs/apollo-server/testing/testing/
const {server, apolloServer} = require('../server')
const testServer = apolloServer
const request = require('supertest')
const context = require('../context')
const User = require('../models/user')
const {userCreateQuery, userLogInQuery, allUsersQuery, meQuery} = require('./userTestQueries')

beforeAll(async () => {
    await mongoose.connect(config.MONGODB_URI)
    await Course.deleteMany({})
    await User.deleteMany({})
})

afterAll(async () => {
    
    await Course.deleteMany({})
    await User.deleteMany({})
    await mongoose.connection.close()
})

beforeEach(async () => {
    await Course.deleteMany({})
    await Task.deleteMany({})
    helpers.logOut()
})


describe('user tests', () => {

    test('user create mutation returns and saves created user correctly', async () => {  
       
        const response = await testServer.executeOperation({query: userCreateQuery, variables: {}})
      
        expect(response.errors).toBeUndefined();
        expect(response.data.createUser).toEqual({name: 'name', username: 'username'})

        const usersQuery = await User.find({username: 'username'})
        expect(usersQuery.length).toEqual(1)
        expect(usersQuery[0].username).toEqual('username')
        expect(usersQuery[0].name).toEqual('name')
    })
    describe('log in tests', () => {
        test('logIn mutation with correct credentials returns a token', async () => {  
        
            const response = await testServer.executeOperation({query: userCreateQuery, variables: {}})
          
            expect(response.errors).toBeUndefined();
            
            const logInResponse = await testServer.executeOperation({query: userLogInQuery, variables: {username: "username", password: "12345"}})
            expect(logInResponse.errors).toBeUndefined();
            expect(logInResponse.data.logIn).toBeDefined();
            
        })

        test('logIn mutation with incorrect password returns a null token and an error', async () => {  
        
            const response = await testServer.executeOperation({query: userCreateQuery, variables: {}})
          
            expect(response.errors).toBeUndefined();
            
            const logInResponse = await testServer.executeOperation({query: userLogInQuery, variables: {username: "username", password: "wrong"}})
          
            expect(logInResponse.errors.toString()).toContain("invalid username or password");
            expect(logInResponse.data.logIn).toBeDefined();
            
        })

        test('logIn mutation with incorrect username returns a null token and an error', async () => {  
        
            const response = await testServer.executeOperation({query: userCreateQuery, variables: {}})
            
            expect(response.errors).toBeUndefined();
            
            const logInResponse = await testServer.executeOperation({query: userLogInQuery, variables: {username: "username3", password: "12345"}})
           
            expect(logInResponse.errors.toString()).toContain("invalid username or password");
            expect(logInResponse.data.logIn).toBeDefined();
            
        })
    })

    describe('authorization tests', () => {
        test('query "Me" returns user information if the token is valid', async () => {
            const response = await testServer.executeOperation({query: userCreateQuery, variables: {}})
            const logInResponse = await testServer.executeOperation({query: userLogInQuery, variables: {username: "username", password: "12345"}})
            const token = logInResponse.data.logIn
            const authorization = `bearer ${token.value.toString()}`
           // console.log(authorization)
            const queryForCurrentUser = {
                query: meQuery,
                variables: {},
            }

            const currentUserQuery = await request('http://localhost:4000/').post('/').send(queryForCurrentUser).set('Authorization', authorization)
            expect(currentUserQuery.body.data.me).toEqual({name: "name", username: "username"})
        })

        test('query "Me" returns null if no token is given', async () => {
            const queryForCurrentUser = {
                query: meQuery,
                variables: {},
            }

            const currentUserQuery = await request('http://localhost:4000/').post('/').send(queryForCurrentUser)
           
            expect(currentUserQuery.body.data).toEqual(null)
        })

        test('query "Me" returns null if invalid token is given', async () => {
            const response = await testServer.executeOperation({query: userCreateQuery, variables: {}})
            const logInResponse = await testServer.executeOperation({query: userLogInQuery, variables: {username: "username", password: "12345"}})
            const token = logInResponse.data.logIn
            
            const authorization = `bearer ${token.value.toString()}abc`
            
            const queryForCurrentUser = {
                query: meQuery,
                variables: {},
            }

            const currentUserQuery = await request('http://localhost:4000/').post('/').send(queryForCurrentUser).set('Authorization', authorization)
           
            expect(currentUserQuery.body.data).toEqual(null)
        })
    })
})

afterAll(async () => {
    //we use different database for tests, lets clear the database
    await User.deleteMany({})
    await server.stop()
})

