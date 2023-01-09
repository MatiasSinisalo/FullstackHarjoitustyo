import { gql } from '@apollo/client'


export const LOGIN = gql`
mutation LogIn($username: String!, $password: String!) {
    logIn(username: $username, password: $password) {
      value
    }
  }
`

export const ME = gql`
query Me {
  me {
    name
    username
  }
}
`

