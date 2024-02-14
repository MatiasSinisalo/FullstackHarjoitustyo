

const {mustHaveToken} = require('../resolverUtils');
const taskService = require('../../services/course/taskService');
const submissionService = require('../../services/course/submissionService');

const taskResolvers = {
  addTaskToCourse: async (root, args, context) => {
    mustHaveToken(context);


    const courseUniqueName = args.courseUniqueName;
    const description = args.description;
    const deadline = args.deadline;
    const maxGrade = args?.maxGrade;
    const newTask = await taskService.addTaskToCourse(courseUniqueName, description, deadline, maxGrade, context.userForToken);

    return newTask;
  },
  removeTaskFromCourse: async (root, args, context) => {
    mustHaveToken(context);

    const courseUniqueName = args.courseUniqueName;
    const taskId = args.taskId;
    const taskRemoved = await taskService.removeTaskFromCourse(courseUniqueName, taskId, context.userForToken);
    return taskRemoved;
  },
  addSubmissionToCourseTask: async (root, args, context) => {
    mustHaveToken(context);
    const courseUniqueName = args.courseUniqueName;
    const content = args.content;
    const submitted = args.submitted;
    const taskID = args.taskId;

    const createdSubmission = await submissionService.addSubmissionToCourseTask(courseUniqueName, taskID, content, submitted, context.userForToken);

    return createdSubmission;
  },
  modifySubmission: async (root, args, context) => {
    mustHaveToken(context);

    const courseUniqueName = args.courseUniqueName;
    const taskID = args.taskId;
    const submissionId = args.submissionId;
    const content = args.content;
    const submitted = args.submitted;
    const modifiedSubmission = await submissionService.modifySubmission(courseUniqueName, taskID, submissionId, content, submitted, context.userForToken);
    return modifiedSubmission;
  },
  removeSubmissionFromCourseTask: async (root, args, context) =>{
    mustHaveToken(context);
    const courseUniqueName = args.courseUniqueName;
    const taskId = args.taskId;
    const submissionId = args.submissionId;
    const submissionRemoved = await submissionService.removeSubmissionFromCourseTask(courseUniqueName, taskId, submissionId, context.userForToken);
    return submissionRemoved;
  },
  gradeSubmission: async (root, args, context) => {
    mustHaveToken(context);
    const courseUniqueName = args.courseUniqueName;
    const taskId = args.taskId;
    const submissionId = args.submissionId;
    const points = args.points;
    const gradedSubmission = await submissionService.gradeSubmission(courseUniqueName, taskId, submissionId, points, context.userForToken);
    return gradedSubmission;
  },
  createMultipleChoiceTask: async (root, args, context) => {
    mustHaveToken(context);
    const courseUniqueName = args.courseUniqueName;
    const description = args.description;
    const deadline = args.deadline;
    const newMultipleChoiceTask = await taskService.addMultipleChoiceTask(courseUniqueName, description, deadline, context.userForToken);
    return newMultipleChoiceTask;
  },
  removeMultipleChoiceTask: async (root, args, context) => {
    mustHaveToken(context);
    const courseUniqueName = args.courseUniqueName;
    const multipleChoiceTaskID = args.multipleChoiceTaskId;
    const multipleChoiceTaskRemoved = await taskService.removeMultipleChoiceTask(courseUniqueName, multipleChoiceTaskID, context.userForToken);
    return multipleChoiceTaskRemoved;
  },
};

module.exports = {taskResolvers};
