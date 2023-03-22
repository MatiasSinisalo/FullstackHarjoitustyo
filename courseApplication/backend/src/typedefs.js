const { gql } = require("apollo-server");
const {  CourseTypeDefs } = require("./typedefs/CourseTypeDefs");
const { UserTypeDefs } = require("./typedefs/UserTypeDefs");

const typeDefs = gql`
    ${UserTypeDefs}
    ${CourseTypeDefs}

    type Mutation{
        reset:Boolean
    }

`

module.exports = typeDefs