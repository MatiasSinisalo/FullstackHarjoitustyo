

const {Course} = require('../../models/course');
const User = require('../../models/user');
const {Task} = require('../../models/task');
const {userCreateQuery, createSpesificUserQuery} = require('../userTestQueries');
const {createCourse, addTaskToCourse, removeCourse, addSubmissionToCourseTask, addStudentToCourse} = require('../courseTestQueries');
const helpers = require('../testHelpers');


beforeEach(async () => {
  await User.deleteMany({});
  await helpers.makeQuery({query: userCreateQuery, variables: {}});
  await helpers.makeQuery({query: createSpesificUserQuery, variables: {username: 'students username', name: 'students name', password: '12345'}});
});


describe('removeCourse tests', () => {
  test('removeCourse removes course and its child objects from database', async ()=>{
    await helpers.logIn('username');

    const courseToBeRemoved = {
      uniqueName: 'course-to-be-removed',
      name: 'common name',
    };

    const courseThatShouldNotBeRemoved = {
      uniqueName: 'course-that-should-not-be-removed',
      name: 'common name',
    };
    await helpers.makeQuery({query: createCourse, variables: {uniqueName: courseToBeRemoved.uniqueName, name: courseToBeRemoved.name, teacher: ''}});
    await helpers.makeQuery({query: createCourse, variables: {uniqueName: courseThatShouldNotBeRemoved.uniqueName, name: courseThatShouldNotBeRemoved.name, teacher: ''}});

    const task = {
      description: 'this is the description of the course that is about testing',
      deadline: new Date('2030-06-25'),
      submissions: [],
    };
    const taskCreateQuery = await helpers.makeQuery({query: addTaskToCourse, variables: {
      courseUniqueName: courseToBeRemoved.uniqueName,
      description: task.description,
      deadline: task.deadline.toString(),
    }});

    const submission = {
      content: 'this is the answer to a task',
      submitted: true,
      taskId: taskCreateQuery.data.addTaskToCourse.id,
    };
    await helpers.makeQuery({query: addSubmissionToCourseTask, variables: {
      courseUniqueName: courseToBeRemoved.uniqueName,
      taskId: submission.taskId,
      content: submission.content,
      submitted: submission.submitted,
    }});

    const courseRemoveQuery = await helpers.makeQuery({query: removeCourse, variables: {uniqueName: courseToBeRemoved.uniqueName}});
    expect(courseRemoveQuery.data.removeCourse).toBe(true);

    const coursesInDB = await Course.find({});
    expect(coursesInDB.length).toBe(1);
    expect(coursesInDB[0].uniqueName).toEqual(courseThatShouldNotBeRemoved.uniqueName);
    expect(coursesInDB[0].name).toEqual(courseThatShouldNotBeRemoved.name);
    expect(coursesInDB[0].teacher).toBeDefined();

    const tasksInDB = await Task.find({});
    expect(tasksInDB.length).toBe(0);
  });

  test('removeCourse removes reference to it from teachers teachesCourses ref array', async ()=>{
    await helpers.logIn('username');

    const courseToBeRemoved = {
      uniqueName: 'course-to-be-removed',
      name: 'common name',
    };


    await helpers.makeQuery({query: createCourse, variables: {uniqueName: courseToBeRemoved.uniqueName, name: courseToBeRemoved.name, teacher: ''}});

    const courseRemoveQuery = await helpers.makeQuery({query: removeCourse, variables: {uniqueName: courseToBeRemoved.uniqueName}});
    expect(courseRemoveQuery.data.removeCourse).toBe(true);

    const coursesInDB = await Course.find({});
    expect(coursesInDB.length).toBe(0);

    const userInDB = await User.findOne({username: 'username'});
    expect(userInDB.teachesCourses.length).toBe(0);
  });

  test('removeCourse removes reference to it from students attendedCourses ref array', async ()=>{
    await helpers.logIn('username');

    const courseToBeRemoved = {
      uniqueName: 'course-to-be-removed',
      name: 'common name',
    };

    const courseThatShouldNotBeRemoved = {
      uniqueName: 'course-that-should-not-be-removed',
      name: 'common name',
    };
    await helpers.makeQuery({query: createCourse, variables: {uniqueName: courseThatShouldNotBeRemoved.uniqueName, name: courseThatShouldNotBeRemoved.name, teacher: ''}});
    await helpers.makeQuery({query: addStudentToCourse, variables: {addStudentToCourseUsername: 'students username', courseUniqueName: courseThatShouldNotBeRemoved.uniqueName}});

    await helpers.makeQuery({query: createCourse, variables: {uniqueName: courseToBeRemoved.uniqueName, name: courseToBeRemoved.name, teacher: ''}});
    await helpers.makeQuery({query: addStudentToCourse, variables: {addStudentToCourseUsername: 'students username', courseUniqueName: courseToBeRemoved.uniqueName}});
    const courseRemoveQuery = await helpers.makeQuery({query: removeCourse, variables: {uniqueName: courseToBeRemoved.uniqueName}});
    expect(courseRemoveQuery.data.removeCourse).toBe(true);

    const coursesInDB = await Course.find({});
    expect(coursesInDB.length).toBe(1);
    expect(coursesInDB[0].uniqueName).toEqual(courseThatShouldNotBeRemoved.uniqueName);

    const userInDB = await User.findOne({username: 'username'});
    expect(userInDB.teachesCourses.length).toBe(1);
    expect(userInDB.teachesCourses[0].toString()).toBe(coursesInDB[0].id);

    const studentInDB = await User.findOne({username: 'students username'});
    expect(studentInDB.attendsCourses.length).toBe(1);
    expect(studentInDB.attendsCourses[0].toString()).toBe(coursesInDB[0].id);
  });
  test('removeCourse query returns Unauthorized if user that is not a teacher tries to remove the course', async () => {
    await helpers.logIn('username');

    const courseToNotBeRemoved = {
      uniqueName: 'course-to-be-removed',
      name: 'common name',
    };
    await helpers.makeQuery({query: createCourse, variables: {uniqueName: courseToNotBeRemoved.uniqueName, name: courseToNotBeRemoved.name, teacher: ''}});

    await helpers.logIn('students username');

    const courseRemoveQuery = await helpers.makeQuery({query: removeCourse, variables: {uniqueName: courseToNotBeRemoved.uniqueName}});
    expect(courseRemoveQuery.data.removeCourse).toBe(null);
    expect(courseRemoveQuery.errors[0].message).toBe('Unauthorized');


    const coursesInDB = await Course.find({});
    expect(coursesInDB.length).toBe(1);
    expect(coursesInDB[0].uniqueName).toEqual(courseToNotBeRemoved.uniqueName);
    expect(coursesInDB[0].name).toEqual(courseToNotBeRemoved.name);
    expect(coursesInDB[0].teacher).toBeDefined();
  });

  test('removeCourse query returns No given course found! if trying to remove a course that does not exist', async () => {
    await helpers.logIn('username');

    const courseToNotBeRemoved = {
      uniqueName: 'course-to-be-removed',
      name: 'common name',
    };
    await helpers.makeQuery({query: createCourse, variables: {uniqueName: courseToNotBeRemoved.uniqueName, name: courseToNotBeRemoved.name, teacher: ''}});

    const courseRemoveQuery = await helpers.makeQuery({query: removeCourse, variables: {uniqueName: 'this course does not exist'}});
    expect(courseRemoveQuery.data.removeCourse).toBe(null);
    expect(courseRemoveQuery.errors[0].message).toBe('Given course not found');


    const coursesInDB = await Course.find({});
    expect(coursesInDB.length).toBe(1);
    expect(coursesInDB[0].uniqueName).toEqual(courseToNotBeRemoved.uniqueName);
    expect(coursesInDB[0].name).toEqual(courseToNotBeRemoved.name);
    expect(coursesInDB[0].teacher).toBeDefined();
  });
});
