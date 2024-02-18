import client from '../client';

/**
 * Sends a apollo query request to backend
 * @param {*} query query to send to backend
 * @param {*} variables variables used in the query
 * @param {*} successFunc function to execute if the query is successfull
 * @returns 
 * Success: data: result of success function, error: null. 
 * Failure: data: null, error: error reported by the backend.
 */
const queryBackend = async (query, variables, successFunc) => {
    const result = client.query({query: query, variables: variables})
    .then((response) => {
      const successFuncReturn = successFunc(response)
      return successFuncReturn
    })
    .catch((error) => {return {data: null, error: error}})
    return result
  }
  
  /**
   * Sends a apollo mutation request to backend
   * @param {*} mutation mutation to send to backend
   * @param {*} variables variables used in the mutation
   * @param {*} successFunc function to execute if the mutation is successfull
   * @returns 
   * Success: data: result of success function, 
   * Failure: null. Failure: data:null, error: error reported by the backend
   */
  const mutateBackend = async (mutation, variables, successFunc) => {
    const result = client.mutate({mutation: mutation, variables: variables})
    .then((response) => {
      const successFuncReturn = successFunc(response)
      return {data: successFuncReturn, error: null}
    })
    .catch((error) => {return {data: null, error: error}})
    return result
  }


export default {
    queryBackend,
    mutateBackend
}