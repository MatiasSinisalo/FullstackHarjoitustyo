

const {Course} = require('../../models/course');
const {createCourse, addTaskToCourse} = require('../courseTestQueries');
const helpers = require('../testHelpers');


describe('addTaskToCourse query tests', () => {
  test('addTaskToCourse creates a new task on the course with correct parameters', async () => {
    await helpers.logIn('username');
    await helpers.makeQuery({query: createCourse, variables: {uniqueName: 'course-owned-by-username', name: 'common name', teacher: 'username'}});

    const task = {
      courseUniqueName: 'course-owned-by-username',
      description: 'this is the description of the course that is about testing',
      deadline: new Date('2030-06-25'),
      maxGrade: 10,
      submissions: [],
    };

    const newTaskQuery = await helpers.makeQuery({query: addTaskToCourse,
      variables: {courseUniqueName: task.courseUniqueName, description: task.description, deadline: task.deadline.toString(), maxGrade: task.maxGrade}});

    expect(newTaskQuery.data.addTaskToCourse.description).toEqual(task.description);
    expect(newTaskQuery.data.addTaskToCourse.submissions).toEqual([]);

    const dateReturned = parseInt(newTaskQuery.data.addTaskToCourse.deadline);

    expect(new Date(dateReturned)).toEqual(task.deadline);

    await checkDatabaseHasTextTask(task);
  });
  test('addTaskToCourse creates a new task on the course without giving maxGrade', async () => {
    await helpers.logIn('username');
    await helpers.makeQuery({query: createCourse, variables: {uniqueName: 'course-owned-by-username', name: 'common name', teacher: 'username'}});

    const task = {
      courseUniqueName: 'course-owned-by-username',
      description: 'this is the description of the course that is about testing',
      deadline: new Date('2030-06-25'),
      submissions: [],
    };

    const newTaskQuery = await helpers.makeQuery({query: addTaskToCourse, variables: {courseUniqueName: task.courseUniqueName, description: task.description, deadline: task.deadline.toString()}});

    expect(newTaskQuery.data.addTaskToCourse.description).toEqual(task.description);
    expect(newTaskQuery.data.addTaskToCourse.submissions).toEqual([]);

    const dateReturned = parseInt(newTaskQuery.data.addTaskToCourse.deadline);

    expect(new Date(dateReturned)).toEqual(task.deadline);

    await checkDatabaseHasTextTask({...task, maxGrade: undefined});
  });

  test('addTaskToCourse creates a new task on the course that already has tasks with correct parameters', async () => {
    await helpers.logIn('username', '12345');
    await helpers.makeQuery({query: createCourse, variables: {uniqueName: 'course-owned-by-username', name: 'common name', teacher: 'username'}});

    const task = {
      courseUniqueName: 'course-owned-by-username',
      description: 'this is the description of the task that is about testing',
      deadline: new Date('2030-06-25'),
      submissions: [],
    };

    await helpers.makeQuery({query: addTaskToCourse, variables: {courseUniqueName: task.courseUniqueName, description: task.description, deadline: task.deadline.toString()}});

    const secondTask = {
      courseUniqueName: 'course-owned-by-username',
      description: 'this is the description of a task about debugging',
      deadline: new Date('2060-12-01'),
      submissions: [],
    };
    const courseWithAddedTask = await helpers.makeQuery({query: addTaskToCourse,
      variables: {courseUniqueName: secondTask.courseUniqueName, description: secondTask.description, deadline: secondTask.deadline.toString()}});


    // expect(courseWithAddedTask.data.addTaskToCourse.tasks.length).toEqual(2);
    expect(courseWithAddedTask.data.addTaskToCourse.description).toEqual(secondTask.description);
    expect(courseWithAddedTask.data.addTaskToCourse.submissions).toEqual([]);

    const dateReturned = parseInt(courseWithAddedTask.data.addTaskToCourse.deadline);
    expect(new Date(dateReturned)).toEqual(secondTask.deadline);

    expect(courseWithAddedTask.data.addTaskToCourse.description).toEqual(secondTask.description);
    expect(courseWithAddedTask.data.addTaskToCourse.submissions).toEqual([]);
    const secondDateReturned = parseInt(courseWithAddedTask.data.addTaskToCourse.deadline);
    expect(new Date(secondDateReturned)).toEqual(secondTask.deadline);


    const CoursesInDataBase = await Course.find({}).populate('tasks');
    expect(CoursesInDataBase.length).toBe(1);

    const course = CoursesInDataBase[0];
    const textTasks = course.tasks.textTasks;
    expect(textTasks.length).toEqual(2);
    expect(textTasks[0].description).toEqual(task.description);
    expect(textTasks[0].submissions.length).toEqual(0);
    expect(textTasks[0].deadline).toEqual(task.deadline);


    expect(textTasks[1].description).toEqual(secondTask.description);
    expect(textTasks[1].submissions.length).toEqual(0);
    expect(textTasks[1].deadline).toEqual(secondTask.deadline);
  });

  test('addTaskToCourse does not create a new task on the course if the user is not the teacher of the course', async () => {
    await helpers.logIn('username');
    await helpers.makeQuery({query: createCourse, variables: {uniqueName: 'course-owned-by-username', name: 'common name', teacher: 'username'}});


    const task = {
      courseUniqueName: 'course-owned-by-username',
      description: 'this is the description of the course that is about testing',
      deadline: new Date('2030-06-25'),
      submissions: [],
    };
    await helpers.logIn('students username');
    const response = await helpers.makeQuery({query: addTaskToCourse, variables: {courseUniqueName: task.courseUniqueName, description: task.description, deadline: task.deadline.toString()}});
    expect(response.data.addTaskToCourse).toBe(null);
    expect(response.errors[0].message).toBe('Unauthorized');

    await checkNoTextTasksCreatedInDB();
  });

  test('addTaskToCourse returns Given course not found error if the course of the task does not exist', async () => {
    await helpers.logIn('username');
    await helpers.makeQuery({query: createCourse, variables: {uniqueName: 'course-owned-by-username', name: 'common name', teacher: 'username'}});

    const task = {
      courseUniqueName: 'this course does not exist',
      description: 'this is the description of the course that is about testing',
      deadline: new Date('2030-06-25'),
      submissions: [],
    };

    const response = await helpers.makeQuery({query: addTaskToCourse, variables: {courseUniqueName: task.courseUniqueName, description: task.description, deadline: task.deadline.toString()}});
    expect(response.data.addTaskToCourse).toBe(null);
    expect(response.errors[0].message).toBe('Given course not found');

    await checkNoTextTasksCreatedInDB();
  });

  test('addTaskToCourse with empty date parameter', async () => {
    await helpers.logIn('username');
    await helpers.makeQuery({query: createCourse, variables: {uniqueName: 'course-owned-by-username', name: 'common name', teacher: 'username'}});

    const task = {
      courseUniqueName: 'course-owned-by-username',
      description: 'this is the description of the course that is about testing',
      deadline: new Date('2030-06-25'),
      maxGrade: 10,
      submissions: [],
    };

    const newTaskQuery = await helpers.makeQuery({query: addTaskToCourse, variables: {courseUniqueName: task.courseUniqueName, description: task.description, deadline: '', maxGrade: undefined}});
    expect(newTaskQuery.errors[0].message).toEqual('Incorrect date');
    console.log(newTaskQuery);
    expect(newTaskQuery.data.addTaskToCourse).toEqual(null);

    await checkNoTextTasksCreatedInDB();
  });

  test('addTaskToCourse with incorrect date parameter', async () => {
    await helpers.logIn('username');
    await helpers.makeQuery({query: createCourse, variables: {uniqueName: 'course-owned-by-username', name: 'common name', teacher: 'username'}});

    const task = {
      courseUniqueName: 'course-owned-by-username',
      description: 'this is the description of the course that is about testing',
      deadline: new Date('2030-06-25'),
      maxGrade: 10,
      submissions: [],
    };

    const newTaskQuery = await helpers.makeQuery({query: addTaskToCourse,
      variables: {courseUniqueName: task.courseUniqueName, description: task.description, deadline: 'wrong date', maxGrade: undefined}});
    expect(newTaskQuery.errors[0].message).toEqual('Incorrect date');
    console.log(newTaskQuery);
    expect(newTaskQuery.data.addTaskToCourse).toEqual(null);

    await checkNoTextTasksCreatedInDB();
  });
});

async function checkDatabaseHasTextTask(task) {
  const CoursesInDataBase = await Course.find({}).populate('tasks');
  expect(CoursesInDataBase.length).toBe(1);
  const course = CoursesInDataBase[0];
  const textTasks = course.tasks.textTasks;
  expect(textTasks.length).toEqual(1);
  expect(textTasks[0].description).toEqual(task.description);
  expect(textTasks[0].submissions.length).toEqual(0);
  expect(textTasks[0].deadline).toEqual(task.deadline);
  expect(textTasks[0].maxGrade).toEqual(task.maxGrade);
}

async function checkNoTextTasksCreatedInDB() {
  const CoursesInDataBase = await Course.find({}).populate('tasks');
  expect(CoursesInDataBase.length).toBe(1);
  const course = CoursesInDataBase[0];
  expect(course.tasks.textTasks.length).toEqual(0);
}
