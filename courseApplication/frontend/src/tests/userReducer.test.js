import {updateUser} from '../reducers/userReducer'
import store from '../store'

const exampleUser = {username: "users username", name: "users name", token: "abc1234"}
describe('user reducer tests', () => {
    test('updateUser sets user in store correctly', () => {
        store.dispatch(updateUser(exampleUser))
        const storeData = store.getState()
        expect(storeData.user).toEqual(exampleUser)
    })
})