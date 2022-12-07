const { gql } = require("apollo-server");

const typeDefs = gql`
    type User{
        name: String!
    }

    type Query{
        user: Int
    }

`



module.exports = typeDefs