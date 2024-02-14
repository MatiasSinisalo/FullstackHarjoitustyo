

const {Course} = require('../../models/course');
const {addStudentToCourse, gradeSubmission} = require('../courseTestQueries');
const helpers = require('../testHelpers');


describe('grade submission tests', () => {
  test('teacher can give a grade', async () => {
    const user = await helpers.logIn('username');
    const course = await helpers.createCourse('course-unique-name', 'name of course', []);
    const task = await helpers.createTask(course, 'this is a task', new Date(Date.now()), []);
    const submission = await helpers.createSubmission(course, task.id, 'this is an answer', false);

    const points = 10;
    const gradeSubmissionQuery = await helpers.makeQuery({query: gradeSubmission, variables: {courseUniqueName: course.uniqueName, taskId: task.id, submissionId: submission.id, points: points}});
    console.log(gradeSubmissionQuery);
    const gradedSubmission = gradeSubmissionQuery.data.gradeSubmission;
    expect(gradedSubmission.grade.points).toBe(10);

    const courseInDB = await Course.findOne({uniqueName: course.uniqueName});
    const taskInDB = courseInDB.tasks.textTasks[0];
    expect(taskInDB.submissions.length).toBe(1);

    const submissionInDB = taskInDB.submissions[0];
    expect(submissionInDB.content).toEqual('this is an answer');
    expect(submissionInDB.fromUser.toString()).toEqual(user.id);
    expect(submissionInDB.submitted).toEqual(false);
    expect(submissionInDB.submittedDate).toEqual(null);
    expect(submissionInDB.grade.points).toBe(10);

    const gradingDate = new Date(Number(submissionInDB.grade.date)).toISOString().split('T')[0];
    const today = new Date(Date.now()).toISOString().split('T')[0];
    expect(gradingDate).toEqual(today);
  });

  test('grade submission returns course not found if the Course does not exist', async () => {
    const user = await helpers.logIn('username');
    const course = await helpers.createCourse('course-unique-name', 'name of course', []);
    const task = await helpers.createTask(course, 'this is a task', new Date(Date.now()), []);
    const submission = await helpers.createSubmission(course, task.id, 'this is an answer', false);

    const points = 10;
    const gradeSubmissionQuery = await helpers.makeQuery({query: gradeSubmission,
      variables: {courseUniqueName: 'this course wont exist', taskId: task.id, submissionId: submission.id, points: points}});
    expect(gradeSubmissionQuery.errors[0].message).toEqual('Given course not found');
    console.log(gradeSubmissionQuery);
    const gradedSubmission = gradeSubmissionQuery.data.gradeSubmission;
    expect(gradedSubmission).toBe(null);

    await checkDatabaseSubmissionGradeNotChanged(course, user);
  });

  test('grade submission returns task not found if the task does not exist', async () => {
    const user = await helpers.logIn('username');
    const course = await helpers.createCourse('course-unique-name', 'name of course', []);
    const task = await helpers.createTask(course, 'this is a task', new Date(Date.now()), []);
    const submission = await helpers.createSubmission(course, task.id, 'this is an answer', false);

    const points = 10;
    const gradeSubmissionQuery = await helpers.makeQuery({query: gradeSubmission,
      variables: {courseUniqueName: course.uniqueName, taskId: 'incorrectTaskId', submissionId: submission.id, points: points}});
    expect(gradeSubmissionQuery.errors[0].message).toEqual('Given task not found');
    console.log(gradeSubmissionQuery);
    const gradedSubmission = gradeSubmissionQuery.data.gradeSubmission;
    expect(gradedSubmission).toBe(null);

    await checkDatabaseSubmissionGradeNotChanged(course, user);
  });

  test('grade submission returns submission not found if the submission does not exist', async () => {
    const user = await helpers.logIn('username');
    const course = await helpers.createCourse('course-unique-name', 'name of course', []);
    const task = await helpers.createTask(course, 'this is a task', new Date(Date.now()), []);
    await helpers.createSubmission(course, task.id, 'this is an answer', false);

    const points = 10;
    const gradeSubmissionQuery = await helpers.makeQuery({query: gradeSubmission,
      variables: {courseUniqueName: course.uniqueName, taskId: task.id, submissionId: 'incorrectSubmissionId', points: points}});
    expect(gradeSubmissionQuery.errors[0].message).toEqual('Given submission not found');
    console.log(gradeSubmissionQuery);
    const gradedSubmission = gradeSubmissionQuery.data.gradeSubmission;
    expect(gradedSubmission).toBe(null);

    await checkDatabaseSubmissionGradeNotChanged(course, user);
  });

  test('grade submission returns unauthorized if the user is not teacher', async () => {
    const user = await helpers.logIn('username');
    const course = await helpers.createCourse('course-unique-name', 'name of course', []);
    const task = await helpers.createTask(course, 'this is a task', new Date(Date.now()), []);
    const submission = await helpers.createSubmission(course, task.id, 'this is an answer', false);

    await helpers.logIn('students username');
    await helpers.makeQuery({query: addStudentToCourse, variables: {courseUniqueName: 'course-unique-name', addStudentToCourseUsername: 'students username'}});

    const points = 10;
    const gradeSubmissionQuery = await helpers.makeQuery({query: gradeSubmission, variables: {courseUniqueName: course.uniqueName, taskId: task.id, submissionId: submission.id, points: points}});
    expect(gradeSubmissionQuery.errors[0].message).toEqual('Unauthorized');
    console.log(gradeSubmissionQuery);
    const gradedSubmission = gradeSubmissionQuery.data.gradeSubmission;
    expect(gradedSubmission).toBe(null);

    await checkDatabaseSubmissionGradeNotChanged(course, user);
  });
});

async function checkDatabaseSubmissionGradeNotChanged(course, user) {
  const courseInDB = await Course.findOne({uniqueName: course.uniqueName});
  const taskInDB = courseInDB.tasks.textTasks[0];
  expect(taskInDB.submissions.length).toBe(1);
  const submissionInDB = taskInDB.submissions[0];
  expect(submissionInDB.content).toEqual('this is an answer');
  expect(submissionInDB.fromUser.toString()).toEqual(user.id);
  expect(submissionInDB.submitted).toEqual(false);
  expect(submissionInDB.submittedDate).toEqual(null);
  expect(submissionInDB.grade).toBe(undefined);
}
