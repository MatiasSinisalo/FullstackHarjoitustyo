

const {Course} = require('../../models/course');
const {modifySubmission} = require('../courseTestQueries');
const helpers = require('../testHelpers');


describe('modify submission tests', () => {
  test('user can modify a submission made by the user', async () => {
    const user = await helpers.logIn('username');
    const course = await helpers.createCourse('course-unique-name', 'name of course', []);
    const task = await helpers.createTask(course, 'this is a task', new Date(Date.now()), []);
    const submission = await helpers.createSubmission(course, task.id, 'this is an answer', false);


    const newContent = 'this is modified content';
    const newSubmitted = true;
    const modifySubmissionQuery = await helpers.makeQuery({query: modifySubmission,
      variables:
            {courseUniqueName: course.uniqueName, taskId: task.id, submissionId: submission.id, content: newContent, submitted: newSubmitted}});

    const returnedModifiedSubmission = modifySubmissionQuery.data.modifySubmission;
    expect(returnedModifiedSubmission.content).toEqual(newContent);
    expect(returnedModifiedSubmission.submitted).toEqual(newSubmitted);
    expect(returnedModifiedSubmission.fromUser).toEqual({username: user.username, name: user.name, id: user.id});

    await checkSubmissionInDB(newContent, newSubmitted, user);
  });

  test('user can not modify a returned submission', async () => {
    const user = await helpers.logIn('username');
    const course = await helpers.createCourse('course-unique-name', 'name of course', []);
    const task = await helpers.createTask(course, 'this is a task', new Date(Date.now()), []);
    const submission = await helpers.createSubmission(course, task.id, 'this is an answer', true);


    const newContent = 'this is modified content';
    const newSubmitted = false;
    const modifySubmissionQuery = await helpers.makeQuery({query: modifySubmission,
      variables:
            {courseUniqueName: course.uniqueName, taskId: task.id, submissionId: submission.id, content: newContent, submitted: newSubmitted}});

    expect(modifySubmissionQuery.errors[0].message).toEqual('This submission has already been returned');
    expect(modifySubmissionQuery.data.modifySubmission).toEqual(null);

    await checkSubmissionInDB(submission.content, submission.submitted, user);
  });
  test('user can not modify a submission made by another user', async () => {
    await helpers.logIn('username');
    const course = await helpers.createCourse('course-unique-name', 'name of course', []);
    const task = await helpers.createTask(course, 'this is a task', new Date(Date.now()), []);
    const submission = await helpers.createSubmission(course, task.id, 'this is an answer', true);

    await helpers.logIn('students username');
    const newContent = 'this is modified content';
    const newSubmitted = false;
    const modifySubmissionQuery = await helpers.makeQuery({query: modifySubmission,
      variables:
            {courseUniqueName: course.uniqueName, taskId: task.id, submissionId: submission.id, content: newContent, submitted: newSubmitted}});
    expect(modifySubmissionQuery.errors[0].message).toEqual('Unauthorized');
    expect(modifySubmissionQuery.data.modifySubmission).toEqual(null);

    await checkSubmissionInDB(submission.content, submission.submitted, submission.fromUser);
  });
  test('user must be logged in to modify a submission', async () => {
    await helpers.logIn('username');
    const course = await helpers.createCourse('course-unique-name', 'name of course', []);
    const task = await helpers.createTask(course, 'this is a task', new Date(Date.now()), []);
    const submission = await helpers.createSubmission(course, task.id, 'this is an answer', true);

    helpers.logOut();
    const newContent = 'this is modified content';
    const newSubmitted = false;
    const modifySubmissionQuery = await helpers.makeQuery({query: modifySubmission,
      variables:
            {courseUniqueName: course.uniqueName, taskId: task.id, submissionId: submission.id, content: newContent, submitted: newSubmitted}});
    expect(modifySubmissionQuery.errors[0].message).toEqual('Unauthorized');
    expect(modifySubmissionQuery.data.modifySubmission).toEqual(null);


    await checkSubmissionInDB(submission.content, submission.submitted, submission.fromUser);
  });

  test('modify submission returns course not found if given course is not found', async () => {
    await helpers.logIn('username');

    const newContent = 'this is modified content';
    const newSubmitted = false;
    const modifySubmissionQuery = await helpers.makeQuery({query: modifySubmission,
      variables:
            {courseUniqueName: 'course does not exist', taskId: 'abc1234', submissionId: 'abc43231', content: newContent, submitted: newSubmitted}});

    expect(modifySubmissionQuery.errors[0].message).toEqual('Given course not found');

    const courses = await Course.find({});
    expect(courses).toEqual([]);
  });

  test('modify submission returns task not found if given task is not found', async () => {
    await helpers.logIn('username');
    const course = await helpers.createCourse('course-unique-name', 'name of course', []);


    const anotherCourse = await helpers.createCourse('second-course-unique-name', 'name of course', []);
    const taskOnAnotherCourse = await helpers.createTask(anotherCourse, 'this is a task in another course', new Date(Date.now()), []);


    const newContent = 'this is modified content';
    const newSubmitted = false;
    const modifySubmissionQuery = await helpers.makeQuery({query: modifySubmission,
      variables:
            {courseUniqueName: course.uniqueName, taskId: taskOnAnotherCourse.id, submissionId: 'abc43231', content: newContent, submitted: newSubmitted}});

    expect(modifySubmissionQuery.errors[0].message).toEqual('Given task not found');

    const courseInDB = await Course.findOne({uniqueName: course.uniqueName});
    expect(courseInDB.tasks.textTasks).toEqual(course.tasks.textTasks);
    const anotherCourseInDB = await Course.findOne({uniqueName: anotherCourse.uniqueName});
    expect(anotherCourseInDB.tasks.textTasks.length).toEqual(1);
    expect(anotherCourseInDB.tasks.textTasks[0].submissions.length).toEqual(0);
  });


  test('modify submission returns submission not found if given submission is not found', async () => {
    await helpers.logIn('username');
    const course = await helpers.createCourse('course-unique-name', 'name of course', []);
    const task = await helpers.createTask(course, 'this is a task in course', new Date(Date.now()), []);
    const wrongSubmssionOnCourse = await helpers.createSubmission(course, task.id, 'this is an answer that should not be modified', true);


    const anotherCourse = await helpers.createCourse('second-course-unique-name', 'name of course', []);
    const taskOnAnotherCourse = await helpers.createTask(anotherCourse, 'this is a task in another course', new Date(Date.now()), []);
    const submissionOnAnotherTask = await helpers.createSubmission(anotherCourse, taskOnAnotherCourse.id, 'this is an answer', true);


    const newContent = 'this is modified content';
    const newSubmitted = false;
    const modifySubmissionQuery = await helpers.makeQuery({query: modifySubmission,
      variables:
            {courseUniqueName: course.uniqueName, taskId: task.id, submissionId: submissionOnAnotherTask.id, content: newContent, submitted: newSubmitted}});

    expect(modifySubmissionQuery.errors[0].message).toEqual('Given submission not found');

    const courseInDB = await Course.findOne({uniqueName: course.uniqueName});
    expect(courseInDB.tasks.textTasks.length).toEqual(1);
    expect(courseInDB.tasks.textTasks[0].submissions.length).toEqual(1);
    expect(courseInDB.tasks.textTasks[0].submissions[0].content).toEqual(wrongSubmssionOnCourse.content);
    expect(courseInDB.tasks.textTasks[0].submissions[0].submitted).toEqual(wrongSubmssionOnCourse.submitted);

    const anotherCourseInDB = await Course.findOne({uniqueName: anotherCourse.uniqueName});
    expect(anotherCourseInDB.tasks.textTasks.length).toEqual(1);
    expect(anotherCourseInDB.tasks.textTasks[0].submissions.length).toEqual(1);
    expect(anotherCourseInDB.tasks.textTasks[0].submissions[0].content).toEqual(submissionOnAnotherTask.content);
    expect(anotherCourseInDB.tasks.textTasks[0].submissions[0].submitted).toEqual(submissionOnAnotherTask.submitted);
  });
});
async function checkSubmissionInDB(newContent, newSubmitted, user) {
  const courseInDB = await Course.findOne({uniqueName: 'course-unique-name'});
  const tasks = courseInDB.tasks.textTasks;
  expect(tasks.length).toBe(1);
  expect(tasks[0].submissions.length).toBe(1);
  const submissionInDB = tasks[0].submissions[0];
  expect(submissionInDB.content).toEqual(newContent);
  expect(submissionInDB.submitted).toEqual(newSubmitted);
  expect(submissionInDB.fromUser.toString()).toEqual(user.id);
}

