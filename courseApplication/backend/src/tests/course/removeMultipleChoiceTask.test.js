const {Course} = require('../../models/course');
const {createMultipleChoiceTask, removeMultipleChoiceTask} = require('../courseTestQueries');
const helpers = require('../testHelpers');


const checkCoursesNotChanged = async () => {
  const coursesInDB = await Course.find({});
  expect(coursesInDB.length).toBe(1);
  const courseInDB = coursesInDB[0];
  expect(courseInDB.tasks.multipleChoiceTasks.length).toBe(1);
};

describe('removeMultipleChoiceTask tests', () => {
  test('removeMultipleChoiceTask removes multipleChoiceTask from course correctly', async () => {
    await helpers.logIn('username');
    const course = await helpers.createCourse('courseUniqueName', 'courses name', []);

    const deadline = new Date('2030-06-25');
    const example = {
      description: 'this is a description for multiple choice task',
      deadline: deadline.toString(),
      questions: [],
      answers: [],
    };
    const createMultipleChoiceTaskQuery = await helpers.makeQuery({query: createMultipleChoiceTask,
      variables: {courseUniqueName: course.uniqueName, description: example.description, deadline: example.deadline}});


    const removeMultipleChoiceTaskQuery = await helpers.makeQuery({
      query: removeMultipleChoiceTask,
      variables: {courseUniqueName: course.uniqueName, multipleChoiceTaskId: createMultipleChoiceTaskQuery.data.createMultipleChoiceTask.id},
    });

    expect(removeMultipleChoiceTaskQuery.data.removeMultipleChoiceTask).toBe(true);

    const coursesInDB = await Course.find({});
    expect(coursesInDB.length).toBe(1);

    const courseInDB = coursesInDB[0];
    expect(courseInDB.tasks.multipleChoiceTasks.length).toBe(0);
  });

  test('removeMultipleChoiceTask returns Unauthorized if user is not teacher', async () => {
    await helpers.logIn('username');
    const course = await helpers.createCourse('courseUniqueName', 'courses name', []);

    const deadline = new Date('2030-06-25');
    const example = {
      description: 'this is a description for multiple choice task',
      deadline: deadline.toString(),
      questions: [],
      answers: [],
    };
    const createMultipleChoiceTaskQuery = await helpers.makeQuery({query: createMultipleChoiceTask,
      variables: {courseUniqueName: course.uniqueName, description: example.description, deadline: example.deadline}});

    await helpers.logIn('students username');

    const removeMultipleChoiceTaskQuery = await helpers.makeQuery({
      query: removeMultipleChoiceTask,
      variables: {courseUniqueName: course.uniqueName, multipleChoiceTaskId: createMultipleChoiceTaskQuery.data.createMultipleChoiceTask.id},
    });

    expect(removeMultipleChoiceTaskQuery.errors[0].message).toEqual('Unauthorized');

    await checkCoursesNotChanged();
  });

  test('removeMultipleChoiceTask returns given course not found if course is not found', async () => {
    await helpers.logIn('username');
    const course = await helpers.createCourse('courseUniqueName', 'courses name', []);

    const deadline = new Date('2030-06-25');
    const example = {
      description: 'this is a description for multiple choice task',
      deadline: deadline.toString(),
      questions: [],
      answers: [],
    };
    const createMultipleChoiceTaskQuery = await helpers.makeQuery({query: createMultipleChoiceTask,
      variables: {courseUniqueName: course.uniqueName, description: example.description, deadline: example.deadline}});


    const removeMultipleChoiceTaskQuery = await helpers.makeQuery({
      query: removeMultipleChoiceTask,
      variables: {courseUniqueName: 'does not exist', multipleChoiceTaskId: createMultipleChoiceTaskQuery.data.createMultipleChoiceTask.id},
    });

    expect(removeMultipleChoiceTaskQuery.errors[0].message).toEqual('Given course not found');

    await checkCoursesNotChanged();
  });

  test('removeMultipleChoiceTask returns given task not found if multiple choice task is not found', async () => {
    await helpers.logIn('username');
    const course = await helpers.createCourse('courseUniqueName', 'courses name', []);

    const deadline = new Date('2030-06-25');
    const example = {
      description: 'this is a description for multiple choice task',
      deadline: deadline.toString(),
      questions: [],
      answers: [],
    };
    await helpers.makeQuery({query: createMultipleChoiceTask,
      variables: {courseUniqueName: course.uniqueName, description: example.description, deadline: example.deadline}});


    const removeMultipleChoiceTaskQuery = await helpers.makeQuery({
      query: removeMultipleChoiceTask,
      variables: {courseUniqueName: course.uniqueName, multipleChoiceTaskId: 'imaginaryId1234'},
    });

    expect(removeMultipleChoiceTaskQuery.errors[0].message).toEqual('Given task not found');

    await checkCoursesNotChanged();
  });
});
