import { gql } from '@apollo/client'


const LOGIN = gql`
mutation LogIn($username: String!, $password: String!) {
    logIn(username: $username, password: $password) {
      value
    }
  }
`

module.exports = {LOGIN}