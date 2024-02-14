

const {Course} = require('../../models/course');
const {createCourse, addTaskToCourse, removeTaskFromCourse} = require('../courseTestQueries');
const helpers = require('../testHelpers');


describe('removeTaskFromCourse tests', ()=> {
  test('removeTaskFromCourse removes a task correctly from database', async () => {
    await helpers.logIn('username');

    const course = {
      uniqueName: 'course',
      name: 'common name',
    };
    await helpers.makeQuery({query: createCourse, variables: {uniqueName: course.uniqueName, name: course.name, teacher: ''}});


    const notToBeRemovedTask = {
      description: 'this task should not be removed',
      deadline: new Date('2030-06-25'),
      submissions: [],
    };
    const notToBeRemovedTaskQuery = await helpers.makeQuery({query: addTaskToCourse, variables: {
      courseUniqueName: course.uniqueName,
      description: notToBeRemovedTask.description,
      deadline: notToBeRemovedTask.deadline.toString(),
    }});
    expect(notToBeRemovedTaskQuery.data.addTaskToCourse).toBeDefined();


    const task = {
      description: 'this is the description of the task that is about testing',
      deadline: new Date('2030-06-25'),
      submissions: [],
    };
    const taskCreateQuery = await helpers.makeQuery({query: addTaskToCourse, variables: {
      courseUniqueName: course.uniqueName,
      description: task.description,
      deadline: task.deadline.toString(),
    }});
    const createdTask = taskCreateQuery.data.addTaskToCourse;
    expect(createdTask).toBeDefined();

    const response = await helpers.makeQuery({query: removeTaskFromCourse, variables: {courseUniqueName: course.uniqueName, taskId: createdTask.id}});
    expect(response.data.removeTaskFromCourse).toBe(true);

    const modifiedCourse = await Course.findOne({uniqueName: course.uniqueName});
    expect(modifiedCourse.tasks.textTasks.length).toBe(1);
    expect(modifiedCourse.tasks.textTasks[0].description).toEqual('this task should not be removed');
  });

  test('removeTaskFromCourse returns Unauthorized if the user is not a teacher of the course', async () => {
    await helpers.logIn('username');

    const course = {
      uniqueName: 'course',
      name: 'common name',
    };
    await helpers.makeQuery({query: createCourse, variables: {uniqueName: course.uniqueName, name: course.name, teacher: ''}});

    const task = {
      description: 'this is the description of the task that is about testing',
      deadline: new Date('2030-06-25'),
      submissions: [],
    };
    const taskCreateQuery = await helpers.makeQuery({query: addTaskToCourse, variables: {
      courseUniqueName: course.uniqueName,
      description: task.description,
      deadline: task.deadline.toString(),
    }});
    const createdTask = taskCreateQuery.data.addTaskToCourse;
    expect(createdTask).toBeDefined();


    await helpers.logIn('students username');
    const response = await helpers.makeQuery({query: removeTaskFromCourse, variables: {courseUniqueName: course.uniqueName, taskId: createdTask.id}});
    expect(response.errors[0].message).toEqual('Unauthorized');
    expect(response.data.removeTaskFromCourse).toBe(null);

    const modifiedCourse = await Course.findOne({uniqueName: course.uniqueName});
    expect(modifiedCourse.tasks.textTasks.length).toBe(1);
  });

  test('removeTaskFromCourse returns given course not found if trying to remove task from a not existing course ', async () => {
    await helpers.logIn('username');

    const course = {
      uniqueName: 'course',
      name: 'common name',
    };
    await helpers.makeQuery({query: createCourse, variables: {uniqueName: course.uniqueName, name: course.name, teacher: ''}});

    const task = {
      description: 'this is the description of the task that is about testing',
      deadline: new Date('2030-06-25'),
      submissions: [],
    };
    const taskCreateQuery = await helpers.makeQuery({query: addTaskToCourse, variables: {
      courseUniqueName: course.uniqueName,
      description: task.description,
      deadline: task.deadline.toString(),
    }});
    const createdTask = taskCreateQuery.data.addTaskToCourse;
    expect(createdTask).toBeDefined();

    const response = await helpers.makeQuery({query: removeTaskFromCourse, variables: {courseUniqueName: 'this course does not exist', taskId: createdTask.id}});
    expect(response.errors[0].message).toEqual('Given course not found');
    expect(response.data.removeTaskFromCourse).toBe(null);

    const modifiedCourse = await Course.findOne({uniqueName: course.uniqueName});
    expect(modifiedCourse.tasks.textTasks.length).toBe(1);
  });

  test('removeTaskFromCourse returns given task not found if trying to remove an not existing task from a course ', async () => {
    await helpers.logIn('username');

    const course = {
      uniqueName: 'course',
      name: 'common name',
    };
    await helpers.makeQuery({query: createCourse, variables: {uniqueName: course.uniqueName, name: course.name, teacher: ''}});

    const task = {
      description: 'this is the description of the task that is about testing',
      deadline: new Date('2030-06-25'),
      submissions: [],
    };
    const taskCreateQuery = await helpers.makeQuery({query: addTaskToCourse, variables: {
      courseUniqueName: course.uniqueName,
      description: task.description,
      deadline: task.deadline.toString(),
    }});
    const createdTask = taskCreateQuery.data.addTaskToCourse;
    expect(createdTask).toBeDefined();

    const response = await helpers.makeQuery({query: removeTaskFromCourse, variables: {courseUniqueName: course.uniqueName, taskId: 'abc1234'}});
    expect(response.errors[0].message).toEqual('Given task not found');
    expect(response.data.removeTaskFromCourse).toBe(null);

    const modifiedCourse = await Course.findOne({uniqueName: course.uniqueName});
    expect(modifiedCourse.tasks.textTasks.length).toBe(1);
  });
});
