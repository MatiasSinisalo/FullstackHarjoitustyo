import { gql } from '@apollo/client'


export const LOGIN = gql`
mutation LogIn($username: String!, $password: String!) {
    logIn(username: $username, password: $password) {
      value
    }
  }
`

export const CREATE_USER = gql`
mutation Mutation($username: String!, $name: String!, $password: String!) {
  createUser(username: $username, name: $name, password: $password) {
    name
    username
  }
}
`


export const ME = gql`
query Me {
  me {
    id
    name
    username
  }
}
`

