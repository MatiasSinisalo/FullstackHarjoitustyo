const userCreateQuery = 'mutation Mutation {  createUser(password: "12345", name: "name", username: "username") {    name    username  }}'
const userLogInQuery = 'mutation LogIn($username: String!, $password: String!) {  logIn(username: $username, password: $password) {   value  }}'
const allUsersQuery = 'query AllUsers {  allUsers {    name    username  }}'
const meQuery = 'query Me {  me{    name    username  }}'


module.exports = {userCreateQuery, userLogInQuery, allUsersQuery, meQuery}