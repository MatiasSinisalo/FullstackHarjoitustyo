import { useUserLogIn } from "../services/logInService"

const successfullResult = {
    data: {
        logIn: "abc1234"
    }
}

const failedResult = {
    data: {
        logIn: null
    }
}

const mockClient = {
    mutate : (data) => {
        if(data.variables.username == "username" & data.variables.password == "password"){
            return successfullResult
        }
        else
        {
            return failedResult
        }
    }
}

describe('useUserLogIn hook tests', () => {
    test('useUserLogIn hook returns token returned if username and password are correct', async () => {
        const getToken = useUserLogIn(mockClient)
        const token = await getToken("username", "password")
        expect(token).toBe('abc1234')
    })
    
    test('useUserLogIn hook returns null if if username and password are incorrect', async () => {
        const getToken = useUserLogIn(mockClient)
        const token = await getToken("incorrect", "incorrect password")
        expect(token).toBeUndefined()
    })
})

