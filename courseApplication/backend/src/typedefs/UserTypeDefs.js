const { gql } = require("apollo-server");
const UserTypeDefs = gql`
type User{
    id: ID!
    username: String!
    name: String!
}

type Token{
    value: String!
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

    logIn(
        username: String!
        password: String!
    ):Token
}

`

module.exports = {UserTypeDefs}