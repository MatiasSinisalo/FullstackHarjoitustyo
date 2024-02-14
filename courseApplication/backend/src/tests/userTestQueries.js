
// query with hardcoded values to create a user quickly
const userCreateQuery = 'mutation Mutation {  createUser(password: "12345", name: "name", username: "username") {    name    username  }}';

// query to create a user with arguments
const createSpesificUserQuery = `mutation CreateUser($username: String!, $name: String!, $password: String!) {
    createUser(username: $username, name: $name, password: $password) {
      name
      username
    }
  }
`;

const userLogInQuery = 'mutation LogIn($username: String!, $password: String!) {  logIn(username: $username, password: $password) {   value  }}';
const allUsersQuery = 'query AllUsers {  allUsers {    name    username  }}';
const meQuery = 'query Me {  me{    name    username  }}';


module.exports = {userCreateQuery, userLogInQuery, allUsersQuery, meQuery, createSpesificUserQuery};
