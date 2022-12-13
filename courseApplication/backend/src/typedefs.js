const { gql } = require("apollo-server");

const typeDefs = gql`
    type User{
        username: String!
        name: String!
    }

    
    type Token{
        value: String!
    }

    type Query{
        allUsers: [User!]!
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

module.exports = typeDefs