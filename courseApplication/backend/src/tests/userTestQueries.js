
//query with hardcoded values to create a user quickly
const userCreateQuery = 'mutation Mutation {  createUser(password: "12345", name: "name", username: "username") {    name    username  }}'

//query to create a user with arguments
const createSpesificUserQuery = `mutation CreateUser($createUserUsername2: String!, $name: String!, $createUserPassword2: String!) {
    createUser(username: $createUserUsername2, name: $name, password: $createUserPassword2) {
      name
      username
    }
  }
`

const userLogInQuery = 'mutation LogIn($username: String!, $password: String!) {  logIn(username: $username, password: $password) {   value  }}'
const allUsersQuery = 'query AllUsers {  allUsers {    name    username  }}'
const meQuery = 'query Me {  me{    name    username  }}'


module.exports = {userCreateQuery, userLogInQuery, allUsersQuery, meQuery, createSpesificUserQuery}