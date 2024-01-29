const { gql } = require("apollo-server");
const UserTypeDefs = gql`
type User{
    id: ID!
    username: String!
    name: String!
    teachesCourses: [Course!]
    attendsCourses: [Course!]
}

type Token{
    value: String!
}

enum AuthenticateTokenType{
    TOKEN_LOGIN_SUCCESS
    TOKEN_CREATE_ACCOUNT
}

type AuthenticationResult{
    type: AuthenticateTokenType
    token: Token
}

type Query{
    allUsers: [User!]!
    me: User!
}

type Mutation{
    createUser(
        username: String!
        name: String!
        password: String!
    ):User
    
    authenticateGoogleUser(
        google_token: String!
    ):AuthenticationResult
    
    finalizeGoogleUserCreation(
        username: String!
        createUserToken: String!
    ):User

    authenticateHYUser(
        HY_token: String!
    ):AuthenticationResult
    
    logIn(
        username: String!
        password: String!
    ):Token
}

`

module.exports = {UserTypeDefs}