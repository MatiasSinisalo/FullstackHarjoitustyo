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
    teachesCourses{
      id
      uniqueName
      name
      tasks{
        textTasks{
          id
          description
          deadline
        }
      }
    }
    attendsCourses{
      id
      uniqueName
      name
      tasks{
        textTasks{
          id
          description
          deadline
        }
      }
    }
  }
}
`

export const AUTHENTICATE_GOOGLE_USER = gql`
mutation Mutation($googleToken: String!) {
  authenticateGoogleUser(google_token: $googleToken) {
    token {
      value
    }
    type
  }
}
`

export const FINALIZE_GOOGLE_USER_CREATION = gql`
mutation FinalizeGoogleUserCreation($username: String!, $createUserToken: String!) {
  finalizeGoogleUserCreation(username: $username, createUserToken: $createUserToken) {
    id
    name
    username
  }
}
`