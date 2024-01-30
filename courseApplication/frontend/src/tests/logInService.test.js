import logInService from "../services/logInService"
import client from "../client"
import { LOGIN, ME } from "../queries/userQueries"


const mockClient = jest.mock()
mockClient.cache = jest.mock()
mockClient.cache.updateQuery = jest.fn()

describe('LogInAsUser tests', () => {
    beforeEach(() => {
        localStorage.removeItem('courseApplicationUserToken')
    })

    test('logIn function makes loginQuery mutation and ME query to backend correctly', async () => {
        mockClient.mutate = jest.fn(() => {return {data: {logIn: {value: "abc1234"}}}})
        mockClient.query = jest.fn(() => {return {data: {me: {username: "username", name: "name"}}}})
        const result = await logInService.LogInAsUser("username", "password", mockClient)

        expect(result.username).toEqual("username")

        const mutationQuery = mockClient.mutate.mock.calls[0][0].mutation
        expect(mutationQuery).toEqual(LOGIN)
        const variables = mockClient.mutate.mock.calls[0][0].variables
        expect(variables).toEqual({username: "username", password: "password"})

        const meQuery = mockClient.query.mock.calls[0][0].query
        expect(meQuery).toEqual(ME)
       

    })

    test('logIn returns error correctly', async () => {
        mockClient.mutate = jest.fn(() => {throw new Error("this is some kind of an error")})
        mockClient.query = jest.fn(() => {return {data: {me: {username: "username", name: "name"}}}})
        const result = await logInService.LogInAsUser("username", "password", mockClient)
        expect(result.error.message).toEqual("this is some kind of an error")
        
       

    })
})


