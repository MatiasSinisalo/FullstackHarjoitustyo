import { useUserLogIn } from "../services/logInService"

import '@testing-library/jest-dom/extend-expect'


test('login component shows login form correctly', () => {
    const getToken = useUserLogIn()

})

