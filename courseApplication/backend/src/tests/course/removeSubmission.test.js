

const {Course} = require('../../models/course');
const {createCourse, addTaskToCourse, addStudentToCourse, addSubmissionToCourseTask, removeSubmissionFromCourseTask} = require('../courseTestQueries');
const helpers = require('../testHelpers');


describe('removeSubmissionFromCourseTask tests', () => {
  test('removeSubmissionFromCourseTask modifies database state correctly when a task has one submission', async () => {
    await helpers.logIn('username');
    const course = {uniqueName: 'course-owned-by-username', name: 'common name', teacher: 'username', tasks: []};
    const createdCourse = await helpers.makeQuery({query: createCourse, variables: course});
    expect(createdCourse.data.createCourse).toBeDefined();

    const task = {
      description: 'this is the description of a task that is about testing',
      deadline: new Date('2030-06-25'),
      submissions: [],
    };
    const createdTask = await helpers.makeQuery({query: addTaskToCourse, variables: {courseUniqueName: course.uniqueName, description: task.description, deadline: task.deadline.toString()}});
    const taskID = createdTask.data.addTaskToCourse.id;

    const submission = {
      content: 'this is the answer to a task and should be removed',
      submitted: true,
      taskId: taskID,
    };
    const submissionCreateQuery = await helpers.makeQuery({query: addSubmissionToCourseTask,
      variables: {
        courseUniqueName: course.uniqueName,
        taskId: submission.taskId,
        content: submission.content,
        submitted: submission.submitted,
      }});
    const submissionID = submissionCreateQuery.data.addSubmissionToCourseTask.id;

    const removedQuery = await helpers.makeQuery({query: removeSubmissionFromCourseTask, variables: {courseUniqueName: course.uniqueName, taskId: taskID, submissionId: submissionID}});
    expect(removedQuery.data.removeSubmissionFromCourseTask).toBe(true);
    const courseInDB = await Course.findOne({uniqueName: course.uniqueName});
    const taskInDB = courseInDB.tasks.textTasks[0];
    expect(taskInDB.submissions.length).toBe(0);
  });
  test('removeSubmissionFromCourseTask modifies database state correctly when a task has 2 submissions', async () => {
    await helpers.logIn('username');
    const course = {uniqueName: 'course-owned-by-username', name: 'common name', teacher: 'username', tasks: []};
    const createdCourse = await helpers.makeQuery({query: createCourse, variables: course});
    expect(createdCourse.data.createCourse).toBeDefined();

    const task = {
      description: 'this is the description of a task that is about testing',
      deadline: new Date('2030-06-25'),
      submissions: [],
    };
    const createdTask = await helpers.makeQuery({query: addTaskToCourse, variables: {courseUniqueName: course.uniqueName, description: task.description, deadline: task.deadline.toString()}});

    const taskID = createdTask.data.addTaskToCourse.id;

    const otherUserQuery = await helpers.logIn('students username');
    await helpers.makeQuery({query: addStudentToCourse, variables: {courseUniqueName: 'course-owned-by-username', addStudentToCourseUsername: 'students username'}});

    const submissionToNotBeRemoved = {
      content: 'this is the answer to a task and should not be removed',
      submitted: true,
      taskId: taskID,
    };
    await helpers.makeQuery({query: addSubmissionToCourseTask,
      variables: {
        courseUniqueName: course.uniqueName,
        taskId: submissionToNotBeRemoved.taskId,
        content: submissionToNotBeRemoved.content,
        submitted: submissionToNotBeRemoved.submitted,
      }});

    await helpers.logIn('username');

    const submission = {
      content: 'this is the answer to a task and should be removed',
      submitted: true,
      taskId: taskID,
    };
    const submissionCreateQuery = await helpers.makeQuery({query: addSubmissionToCourseTask,
      variables: {
        courseUniqueName: course.uniqueName,
        taskId: submission.taskId,
        content: submission.content,
        submitted: submission.submitted,
      }});
    const submissionID = submissionCreateQuery.data.addSubmissionToCourseTask.id;

    const removedQuery = await helpers.makeQuery({query: removeSubmissionFromCourseTask, variables: {courseUniqueName: course.uniqueName, taskId: taskID, submissionId: submissionID}});
    expect(removedQuery.data.removeSubmissionFromCourseTask).toBe(true);

    await checkSubmissionExists(course, submissionToNotBeRemoved, otherUserQuery);
  });

  test('removeSubmissionFromCourseTask student can not remove other students submission', async () => {
    const user = await helpers.logIn('username');
    const course = await helpers.createCourse('course-unique-name', 'name of course', []);
    const task = await helpers.createTask(course, 'this is a task', new Date(Date.now()), []);
    const submission = await helpers.createSubmission(course, task.id, 'this is an answer', true);

    await helpers.logIn('students username');
    const removedQuery = await helpers.makeQuery({query: removeSubmissionFromCourseTask,
      variables: {courseUniqueName: course.uniqueName, taskId: task.id, submissionId: submission.id}});
    expect(removedQuery.errors[0].message).toEqual('Unauthorized');
    expect(removedQuery.data.removeSubmissionFromCourseTask).toEqual(null);


    await checkSubmissionExists(course, submission, user);
  });

  test('removeSubmissionFromCourseTask teacher can remove students submission', async () => {
    await helpers.logIn('username');
    const course = await helpers.createCourse('course-unique-name', 'name of course', []);
    const task = await helpers.createTask(course, 'this is a task', new Date(Date.now()), []);

    await helpers.logIn('students username');
    await helpers.makeQuery({query: addStudentToCourse, variables: {courseUniqueName: 'course-unique-name', addStudentToCourseUsername: 'students username'}});
    const submission = await helpers.createSubmission(course, task.id, 'this is an answer', true);

    await helpers.logIn('username');
    const removedQuery = await helpers.makeQuery({query: removeSubmissionFromCourseTask,
      variables: {courseUniqueName: course.uniqueName, taskId: task.id, submissionId: submission.id}});
    expect(removedQuery.data.removeSubmissionFromCourseTask).toEqual(true);

    const courseInDB = await Course.findOne({uniqueName: 'course-unique-name'});
    expect(courseInDB.tasks.textTasks[0].submissions.length).toBe(0);
  });

  test('removeSubmissionFromCourseTask returns course not found if course does not exist', async () => {
    const user = await helpers.logIn('username');
    const course = await helpers.createCourse('course-unique-name', 'name of course', []);
    const task = await helpers.createTask(course, 'this is a task', new Date(Date.now()), []);
    const submission = await helpers.createSubmission(course, task.id, 'this is an answer', true);


    const removedQuery = await helpers.makeQuery({query: removeSubmissionFromCourseTask,
      variables: {courseUniqueName: 'this course does not exist', taskId: task.id, submissionId: submission.id}});

    expect(removedQuery.errors[0].message).toEqual('Given course not found');
    expect(removedQuery.data.removeSubmissionFromCourseTask).toEqual(null);


    await checkSubmissionExists(course, submission, user);
  });

  test('removeSubmissionFromCourseTask returns task not found if task does not exist', async () => {
    const user = await helpers.logIn('username');
    const course = await helpers.createCourse('course-unique-name', 'name of course', []);
    const task = await helpers.createTask(course, 'this is a task', new Date(Date.now()), []);
    const submission = await helpers.createSubmission(course, task.id, 'this is an answer', true);

    const anotherCourse = await helpers.createCourse('second-course', 'name of course', []);
    const anotherTask = await helpers.createTask(anotherCourse, 'this is a different task', new Date(Date.now()), []);
    const differentSubmission = await helpers.createSubmission(anotherCourse, anotherTask.id, 'this is an different answer', true);


    const removedQuery = await helpers.makeQuery({query: removeSubmissionFromCourseTask,
      variables: {courseUniqueName: 'course-unique-name', taskId: anotherTask.id, submissionId: submission.id}});

    expect(removedQuery.errors[0].message).toEqual('Given task not found');
    expect(removedQuery.data.removeSubmissionFromCourseTask).toEqual(null);


    await checkSubmissionExists(course, submission, user);

    await checkSubmissionExists(anotherCourse, differentSubmission, user);
  });

  test('removeSubmissionFromCourseTask returns submission not found if submission does not exist', async () => {
    const user = await helpers.logIn('username');
    const course = await helpers.createCourse('course-unique-name', 'name of course', []);
    const task = await helpers.createTask(course, 'this is a task', new Date(Date.now()), []);
    const submission = await helpers.createSubmission(course, task.id, 'this is an answer', true);

    const anotherCourse = await helpers.createCourse('second-course', 'name of course', []);
    const anotherTask = await helpers.createTask(anotherCourse, 'this is a different task', new Date(Date.now()), []);
    const differentSubmission = await helpers.createSubmission(anotherCourse, anotherTask.id, 'this is an different answer', true);


    const removedQuery = await helpers.makeQuery({query: removeSubmissionFromCourseTask,
      variables: {courseUniqueName: 'course-unique-name', taskId: task.id, submissionId: differentSubmission.id}});

    expect(removedQuery.errors[0].message).toEqual('Given submission not found');
    expect(removedQuery.data.removeSubmissionFromCourseTask).toEqual(null);

    await checkSubmissionExists(course, submission, user);

    await checkSubmissionExists(anotherCourse, differentSubmission, user);
  });
});

async function checkSubmissionExists(course, submission, user) {
  const courseInDB = await Course.findOne({uniqueName: course.uniqueName});
  const taskInDB = courseInDB.tasks.textTasks[0];
  expect(taskInDB.submissions.length).toBe(1);
  expect(taskInDB.submissions[0].content).toEqual(submission.content);
  expect(taskInDB.submissions[0].fromUser.toString()).toEqual(user.id);
}
