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


test('useUserLogIn hook returns token returned by successfull mutate query', async () => {
    const getToken = useUserLogIn(mockClient)
    const token = await getToken("username", "password")
    expect(token).toBe('abc1234')
})

test('useUserLogIn hook returns null if mutation query fails', async () => {
    const getToken = useUserLogIn(mockClient)
    const token = await getToken("incorrect", "incorrect password")
    expect(token).toBeUndefined()
})
