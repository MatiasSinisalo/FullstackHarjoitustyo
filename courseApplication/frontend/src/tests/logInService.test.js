import { useUserLogIn } from "../services/logInService"



test('useUserLogIn hook returns token returned by successfull mutate query', async () => {
    
    const successfullResult = {
        data: {
            logIn: "abc1234"
        }
    }

    const mockClient = {
        mutate : (data) => {
            if(data.variables.username == "username" & data.variables.password == "password"){
                return successfullResult
            }
            else
            {
                return null
            }
        }
    }
     
    const getToken = useUserLogIn(mockClient)
    const token = await getToken("username", "password")
    expect(token).toBe('abc1234')
})

