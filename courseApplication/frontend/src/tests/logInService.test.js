import { LogInAsUser, getToken } from "../services/logInService"
import client from "../client"

const successfullTokenResult = {
    data: {
        logIn: {value: "abc1234"}
    }
}

const failedTokenResult = {
    data: {
        logIn: null
    }
}

const successfullMEQueryResult = {
    data:{
        me: {username: "username", name: "name"}
    }
}

const mockClient = {
    mutate : (data) => {
        if(data.variables.username == "username" & data.variables.password == "password"){
            return successfullTokenResult
        }
        else
        {
            return failedTokenResult
        }
    },
    query: (data) => {
        return successfullMEQueryResult
    }

}

describe('getToken tests', () => {
    test('getToken returns token returned if username and password are correct', async () => {
       
        const token = await getToken("username", "password", mockClient)
        expect(token.value).toBe('abc1234')
    })
    
    test('getToken returns null if if username and password are incorrect', async () => {
       
        const token = await getToken("incorrect", "incorrect password", mockClient)
        expect(token).toBeUndefined()
    })

    test('getToken returns null if if password is incorrect', async () => {
        const token = await getToken("username", "incorrect password", mockClient)
        expect(token).toBeUndefined()
    })
})



describe('useUser hook tests', () => {
    test('LogInAsUser returns username, name, and token if username and password are correct', async () => {
       
        const userData = await LogInAsUser("username", "password", mockClient)
        console.log(userData)
        expect(userData).toEqual({username: "username", name: "name", token: "abc1234"})
    })
    
    test('LogInAsUser returns null if if username and password are incorrect', async () => {
       
        const userData = await LogInAsUser("incorrect", "incorrect password", mockClient)
        expect(userData).toBe(null)
    })

    test('LogInAsUser returns null if if password is incorrect', async () => {
        
        const userData = await LogInAsUser("username", "incorrect", mockClient)
        expect(userData).toBe(null)
    })
})


