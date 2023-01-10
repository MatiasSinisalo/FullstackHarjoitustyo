import { useUserLogIn, useUser } from "../services/logInService"
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

const successfullLogInResult = {
    data:{
        me: {username: "username", name: "name", token: "abc1234"}
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
        return successfullLogInResult
    }

}

describe('useUserLogIn hook tests', () => {
    test('useUserLogIn hook returns token returned if username and password are correct', async () => {
        const getToken = useUserLogIn(mockClient)
        const token = await getToken("username", "password")
        expect(token.value).toBe('abc1234')
    })
    
    test('useUserLogIn hook returns null if if username and password are incorrect', async () => {
        const getToken = useUserLogIn(mockClient)
        const token = await getToken("incorrect", "incorrect password")
        expect(token).toBeUndefined()
    })

    test('useUserLogIn hook returns null if if password is incorrect', async () => {
        const getToken = useUserLogIn(mockClient)
        const token = await getToken("username", "incorrect password")
        expect(token).toBeUndefined()
    })
})



describe('useUser hook tests', () => {
    test('LogInAsUser returns username, name, and token if username and password are correct', async () => {
        const LogInAsUser = useUser(mockClient)
        const userData = await LogInAsUser("username", "password")
        console.log(userData)
        expect(userData).toContain(successfullLogInResult)
    })
    
    test('LogInAsUser returns null if if username and password are incorrect', async () => {
        const LogInAsUser = useUser(mockClient)
        const userData = await LogInAsUser("incorrect", "incorrect password")
        expect(userData).toBe(null)
    })

    test('LogInAsUser returns null if if password is incorrect', async () => {
        const LogInAsUser = useUser(mockClient)
        const userData = await LogInAsUser("username", "incorrect")
        expect(userData).toBe(null)
    })
})


