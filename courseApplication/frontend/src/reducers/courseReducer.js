import courseService from '../services/courseService';
import {Notify} from './notificationReducer';
import store from '../store';
const createNewCourse = async (courseUniqueName, courseName, client) => {
  const createdCourseQuery = await courseService.createCourse(courseUniqueName, courseName, client);
  if (!createdCourseQuery.error) {
    console.log(createdCourseQuery);
    store.dispatch(Notify(`successfully created course ${createdCourseQuery.uniqueName}`, 'successNotification', 5));
    return true;
  } else {
    store.dispatch(Notify(`${createdCourseQuery.error.message}`, 'errorNotification', 5));
    return false;
  }
};

const addStudentToCourse = async (courseUniqueName, username, client) => {
  const courseWithAddedStudent = await courseService.addUserToCourse(courseUniqueName, username, client);
};

const removeStudentFromCourse = async (courseUniqueName, username, client) => {
  const prompt = window.prompt(`type ${username} to confirm removal`);
  if (prompt === username) {
    const updatedCourse = await courseService.removeUserFromCourse(courseUniqueName, username, client);
    if (!updatedCourse.error) {
      store.dispatch(Notify('successfully removed student', 'successNotification', 3));
      return true;
    } else {
      store.dispatch(Notify(updatedCourse.error.message, 'errorNotification', 3));
      return false;
    }
  } else {
    store.dispatch(Notify('removal cancelled', 'errorNotification', 3));
  }
};

const courseHasStudent = (course, studentsUsername) => {
  const hasStudent = course.students.find((user) => user.username === studentsUsername);
  return hasStudent;
};

const removeSubmissionFromTask = async (course, task, submission, client) => {
  const removed = await courseService.removeSubmissionFromCourseTask(course.uniqueName, task.id, submission.id, client);
  if (!removed.error) {
    store.dispatch(Notify('successfully removed submission', 'successNotification', 3));
    return true;
  } else {
    store.dispatch(Notify(removed.error.message, 'errorNotification', 3));
    return false;
  }
};

const createNewTaskOnCourse = async (uniqueName, description, deadline, maxGrade, client) => {
  const addedTask = await courseService.addTaskToCourse(uniqueName, description, deadline, maxGrade, client);
  if (!addedTask.error) {
    store.dispatch(Notify(`successfully created task`, 'successNotification', 5));
    return true;
  } else {
    store.dispatch(Notify(`${addedTask.error.message}`, 'errorNotification', 5));
    return false;
  }
};

const addSubmissionToTask = async (course, task, content, client) => {
  const createdSolutionQuery = await courseService.addSubmissionToCourseTask(course.uniqueName, task.id, content, false, client);
  if (!createdSolutionQuery.error) {
    store.dispatch(Notify(`successfully answered to task`, 'successNotification', 5));
    return createdSolutionQuery;
  } else {
    store.dispatch(Notify(`${createdSolutionQuery.error.message}`, 'errorNotification', 5));
    return null;
  }
};

const editTaskSubmission = async (course, taskId, submissionId, content, submitted, client) => {
  const modifiedSubmission = await courseService.modifySubmission(course.uniqueName, taskId, submissionId, content, submitted, client);
  if (!modifiedSubmission.error) {
    if (submitted) {
      store.dispatch(Notify(`successfully returned task`, 'successNotification', 5));
    } else {
      store.dispatch(Notify(`successfully edited task`, 'successNotification', 5));
    }
    return true;
  } else {
    store.dispatch(Notify(`${modifiedSubmission.error.message}`, 'errorNotification', 5));
    return false;
  }
};

const gradeSubmission = async (courseUniqueName, taskId, submissionId, grade, client) => {
  const gradedSubmission = await courseService.gradeSubmission(courseUniqueName, taskId, submissionId, grade, client);
  if (!gradedSubmission.error) {
    store.dispatch(Notify(`successfully graded submission`, 'successNotification', 5));
    return true;
  } else {
    store.dispatch(Notify(`${gradedSubmission.error.message}`, 'errorNotification', 5));
    return false;
  }
};


const removeTaskFromCourse = async (course, task, client) => {
  const removed = await courseService.removeTaskFromCourse(course.uniqueName, task.id, client);
  if (!removed.error) {
    store.dispatch(Notify('successfully removed task', 'successNotification', 3));
    return true;
  } else {
    store.dispatch(Notify(removed.error.message, 'errorNotification', 3));
    return false;
  }
};

const removeCourse = async (course, client, navigate) => {
  const prompt = window.prompt(`type ${course.uniqueName} to confirm removal`);
  if (prompt === course.uniqueName) {
    console.log('removing course');
    const removed = await courseService.removeCourse(course, client);
    if (!removed.error) {
      store.dispatch(Notify(`successfully removed course`, 'successNotification', 5));
      navigate('/dashboard');
      return true;
    } else {
      store.dispatch(Notify(removed.error.message, 'errorNotification', 5));
      return false;
    }
  }
  return false;
};

const createInfoPageOnCourse = async (course, pageUrl, client) => {
  console.log(pageUrl);
  const infoPage = await courseService.createInfoPage(course.uniqueName, pageUrl, client);
  if (!infoPage?.error) {
    store.dispatch(Notify('successfully created info page', 'successNotification', 3));
    return true;
  } else {
    store.dispatch(Notify(infoPage.error.message, 'errorNotification', 3));
    return false;
  }
};

const removeInfoPageFromCourse = async (course, infoPage, client) => {
  const prompt = window.prompt(`type ${infoPage.locationUrl} to confirm removal`);
  if (prompt === infoPage.locationUrl) {
    const removed = await courseService.removeInfoPage(course.uniqueName, infoPage.id, client);
    if (!removed.error) {
      store.dispatch(Notify(`successfully removed infoPage`, 'successNotification', 5));
      return true;
    } else {
      store.dispatch(Notify(removed.error.message, 'errorNotification', 5));
      return false;
    }
  }
  return false;
};

const createContentBlockOnInfoPage = async (course, pageId, content, position, client) => {
  const contentBlock = await courseService.createContentBlock(course.uniqueName, pageId, content, position, client);
  if (!contentBlock?.error) {
    store.dispatch(Notify('successfully created content block', 'successNotification', 3));
    return true;
  } else {
    store.dispatch(Notify(contentBlock.error.message, 'errorNotification', 3));
    return false;
  }
};

const modifyContentBlock = async (course, pageId, contentBlockId, newContent, client) => {
  const modifiedContentBlock = await courseService.modifyContentBlock(course.uniqueName, pageId, contentBlockId, newContent, client);
  if (!modifiedContentBlock.error) {
    store.dispatch(Notify('successfully modified content block', 'successNotification', 3));
    return true;
  } else {
    store.dispatch(Notify(modifiedContentBlock.error.message, 'errorNotification', 3));
    return false;
  }
};


const removeContentBlockFromInfoPage = async (course, pageId, contentBlockId, client) => {
  const removed = await courseService.removeContentBlock(course.uniqueName, pageId, contentBlockId, client);
  if (!removed.error) {
    store.dispatch(Notify('successfully removed content block', 'successNotification', 3));
    return true;
  } else {
    store.dispatch(Notify(removed.error.message, 'errorNotification', 3));
    return false;
  }
};

const createChatRoom = async (course, chatRoomName, client) => {
  const newChatRoom = await courseService.createChatRoom(course.uniqueName, chatRoomName, client);
  if (!newChatRoom.error) {
    store.dispatch(Notify('successfully created chat room', 'successNotification', 3));
    return true;
  } else {
    store.dispatch(Notify(newChatRoom.error.message, 'errorNotification', 3));
    return false;
  }
};

const removeChatRoom = async (course, chatRoom, client) => {
  return await promterFunc(
      {course, chatRoom, client},
      'Successfully removed chatroom',
      `type ${chatRoom.name} to confirm removal`,
      'removal cancelled',
      (promt, args) => {
        return promt === args.chatRoom.name;
      },
      async (args) => {
        return await courseService.removeChatRoom(args.course.uniqueName, args.chatRoom.id, args.client);
      },
  );
};

const createMessage = async (course, chatRoomId, content, client) => {
  const newMessage = await courseService.createMessage(course.uniqueName, chatRoomId, content, client);
  if (!newMessage.error) {
    store.dispatch(Notify('successfully created message', 'successNotification', 3));
    return true;
  } else {
    store.dispatch(Notify(newMessage.error.message, 'errorNotification', 3));
    return false;
  }
};

const addUserToChatRoom = async (course, chatRoomId, username, client) => {
  const addedUser = await courseService.addUserToChatRoom(course, chatRoomId, username, client);
  if (!addedUser.error) {
    store.dispatch(Notify('successfully added user', 'successNotification', 3));
    return true;
  } else {
    store.dispatch(Notify(addedUser.error.message, 'errorNotification', 3));
    return false;
  }
};

const removeUserFromChatRoom = async (course, chatRoomId, userToRemove, client) => {
  return await promterFunc(
      {course, chatRoomId, userToRemove, client},
      'successfully removed user from chatroom',
      `type ${userToRemove.username} to confirm removal`,
      'removal cancelled',
      (promt, args) => {
        return promt === args.userToRemove.username;
      },
      async (args) => {
        return await courseService.removeUserFromChatRoom(args.course, args.chatRoomId, args.userToRemove, args.client);
      },
  );
};

const leaveChatRoom = async (course, chatRoomId, userToRemove, client) => {
  return await promterFunc({course, chatRoomId, userToRemove, client},
      'successfully left course',
      `type ${userToRemove.username} to confirm leaving`,
      'leaving calcelled',
      (promt, args) => {
        return promt === args.userToRemove.username;
      },
      async (args) => {
        const removedUser = await courseService.removeUserFromChatRoom(args.course, args.chatRoomId, args.userToRemove, args.client);
        return removedUser;
      },
  );
};

const promterFunc = async (args, successMsg, promtMsg, whenFailPromtMsg, promtCheckFunc, reducerAsyncFunc) => {
  const prompt = window.prompt(`${promtMsg}`);
  if (promtCheckFunc(prompt, args)) {
    const result = await reducerAsyncFunc(args);
    if (!result.error) {
      store.dispatch(Notify(`${successMsg}`, 'successNotification', 3));
      return true;
    } else {
      store.dispatch(Notify(result.error.message, 'errorNotification', 3));
      return false;
    }
  } else {
    store.dispatch(Notify(`${whenFailPromtMsg}`, 'errorNotification', 3));
  }
};


export {
  createNewCourse,
  addStudentToCourse,
  removeStudentFromCourse,
  courseHasStudent,
  removeSubmissionFromTask,
  createNewTaskOnCourse,
  addSubmissionToTask,
  editTaskSubmission,
  gradeSubmission,
  removeTaskFromCourse,
  removeCourse,
  createInfoPageOnCourse,
  removeInfoPageFromCourse,
  createContentBlockOnInfoPage,
  modifyContentBlock,
  removeContentBlockFromInfoPage,
  createChatRoom,
  createMessage,
  addUserToChatRoom,
  removeUserFromChatRoom,
  leaveChatRoom,
  removeChatRoom,
};
