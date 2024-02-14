
// source for testing an application that uses graphQL:  https://www.apollographql.com/docs/apollo-server/testing/testing
const request = require('supertest');
const User = require('../models/user');
const {userCreateQuery, userLogInQuery, meQuery} = require('./userTestQueries');
const {Task} = require('../models/task');
const helpers = require('./testHelpers');
const {Course} = require('../models/course');

beforeEach(async () => {
  await User.deleteMany({});
  await Course.deleteMany({});
  await Task.deleteMany({});
  helpers.logOut();
});

describe('user tests', () => {
  test('user create mutation returns and saves created user correctly', async () => {
    const response = await helpers.makeQuery({query: userCreateQuery, variables: {}});

    expect(response.errors).toBeUndefined();
    expect(response.data.createUser).toEqual({name: 'name', username: 'username'});

    const usersQuery = await User.find({username: 'username'});
    expect(usersQuery.length).toEqual(1);
    expect(usersQuery[0].username).toEqual('username');
    expect(usersQuery[0].name).toEqual('name');
  });
  describe('log in tests', () => {
    test('logIn mutation with correct credentials returns a token', async () => {
      const response = await helpers.makeQuery({query: userCreateQuery, variables: {}});

      expect(response.errors).toBeUndefined();

      const logInResponse = await helpers.makeQuery({query: userLogInQuery, variables: {username: 'username', password: '12345'}});
      expect(logInResponse.errors).toBeUndefined();
      expect(logInResponse.data.logIn).toBeDefined();
    });

    test('logIn mutation with incorrect password returns a null token and an error', async () => {
      const response = await helpers.makeQuery({query: userCreateQuery, variables: {}});

      expect(response.errors).toBeUndefined();

      const logInResponse = await helpers.makeQuery({query: userLogInQuery, variables: {username: 'username', password: 'wrong'}});

      expect(logInResponse.errors[0].message).toContain('invalid username or password');
      expect(logInResponse.data.logIn).toBeDefined();
    });

    test('logIn mutation with incorrect username returns a null token and an error', async () => {
      const response = await helpers.makeQuery({query: userCreateQuery, variables: {}});

      expect(response.errors).toBeUndefined();

      const logInResponse = await helpers.makeQuery({query: userLogInQuery, variables: {username: 'username3', password: '12345'}});

      expect(logInResponse.errors[0].message).toContain('invalid username or password');
      expect(logInResponse.data.logIn).toBeDefined();
    });
  });

  describe('authorization tests', () => {
    test('query "Me" returns user information if the token is valid', async () => {
      await helpers.makeQuery({query: userCreateQuery, variables: {}});
      const logInResponse = await helpers.makeQuery({query: userLogInQuery, variables: {username: 'username', password: '12345'}});
      const token = logInResponse.data.logIn;
      const authorization = `bearer ${token.value.toString()}`;
      // console.log(authorization)
      const queryForCurrentUser = {
        query: meQuery,
        variables: {},
      };

      const currentUserQuery = await request('http://localhost:4000/').post('/').send(queryForCurrentUser).set('Authorization', authorization);
      expect(currentUserQuery.body.data.me).toEqual({name: 'name', username: 'username'});
    });

    test('query "Me" returns null if no token is given', async () => {
      const queryForCurrentUser = {
        query: meQuery,
        variables: {},
      };

      const currentUserQuery = await request('http://localhost:4000/').post('/').send(queryForCurrentUser);

      expect(currentUserQuery.body.data).toEqual(null);
    });

    test('query "Me" returns null if invalid token is given', async () => {
      await helpers.makeQuery({query: userCreateQuery, variables: {}});
      const logInResponse = await helpers.makeQuery({query: userLogInQuery, variables: {username: 'username', password: '12345'}});
      const token = logInResponse.data.logIn;

      const authorization = `bearer ${token.value.toString()}abc`;

      const queryForCurrentUser = {
        query: meQuery,
        variables: {},
      };

      const currentUserQuery = await request('http://localhost:4000/').post('/').send(queryForCurrentUser).set('Authorization', authorization);

      expect(currentUserQuery.body.data).toEqual(null);
    });
  });
});


