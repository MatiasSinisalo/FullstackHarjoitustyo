import {ME} from '../queries/userQueries';
import {GET_COURSE} from '../queries/courseQueries';
import client from '../client';

function removeUserRefFromChatRoomCache(client, chatRoomId, userToRemove) {
  client.cache.modify(
      {
        id: `ChatRoom:${chatRoomId}`,
        fields: {
          users(currentUsers) {
            return currentUsers.filter((userRef) => userRef.__ref !== `User:${userToRemove.id}`);
          },
        },
      },
  );
}

function addUserRefToChatRoomCache(client, chatRoomId, user) {
  client.cache.modify(
      {
        id: `ChatRoom:${chatRoomId}`,
        fields: {
          users(currentUsers) {
            return currentUsers.concat({__ref: `User:${user.id}`});
          },
        },
      },
  );
}

function addMessageRefToChatRoomCache(client, chatRoomId, message) {
  client.cache.modify(
      {
        id: `ChatRoom:${chatRoomId}`,
        fields: {
          messages(currentMessages) {
            return currentMessages.concat({__ref: `Message:${message.id}`});
          },
        },
      },
  );
}


function addChatRoomRefToCourseCache(client, courseUniqueName, result) {
  const course = client.readQuery({query: GET_COURSE, variables: {uniqueName: courseUniqueName}}).getCourse;
  const chatRoom = result.data.createChatRoom;
  client.cache.modify({
    id: `Course:${course.id}`,
    fields: {
      chatRooms(currentRooms) {
        return currentRooms.concat({__ref: `ChatRoom:${chatRoom.id}`});
      },
    },
  });
}


function addContentBlockToInfoPageCache(result, client, pageId) {
  const contentBlock = result.data.addContentBlockToInfoPage;
  client.cache.modify({
    id: `InfoPage:${pageId}`,
    fields: {
      contentBlocks(cachedContentBlocks) {
        return cachedContentBlocks.concat({__ref: `ContentBlock:${contentBlock.id}`});
      },
    },
  });
}


function addInfoPageRefToCourseCache(client, courseUniqueName, result) {
  const course = client.readQuery({query: GET_COURSE, variables: {uniqueName: courseUniqueName}}).getCourse;
  client.cache.modify({
    id: client.cache.identify(course),
    fields: {
      infoPages(pages) {
        return pages.concat({__ref: `InfoPage:${result.data.addInfoPageToCourse.id}`});
      },
    },
  });
}


function addSubmissionToCourseTaskCache(client, taskId, newSubmission) {
  client.cache.modify({
    id: `Task:${taskId}`,
    fields: {
      submissions(cachedSubmissions) {
        return cachedSubmissions.concat({__ref: `Submission:${newSubmission.id}`});
      },
    },
  });
}

function addTaskToCourseCache(apolloClient, uniqueName, result) {
  const course = apolloClient.readQuery({query: GET_COURSE, variables: {uniqueName: uniqueName}}).getCourse;
  apolloClient.cache.modify({
    id: apolloClient.cache.identify(course),
    fields: {
      tasks(cachedTasks) {
        console.log(cachedTasks);
        const updatedTasks = cachedTasks.textTasks.concat({__ref: `Task:${result.data.addTaskToCourse.id}`});
        return {...cachedTasks, textTasks: updatedTasks};
      },
    },
  });
}

/**
 * Remove course from locally cached attendsCourses list
 * @param {*} uniqueName uniqueName of the course that should be removed from the list 
 */
function removeAttendsCourseRef(uniqueName) {
  client.cache.updateQuery({query: ME}, (data) => {
    return {me: {...data.me, attendsCourses: data.me.attendsCourses.filter((course) => course.uniqueName != uniqueName)}};
  });
}

/**
 * Appends a course object to users attendsCourses lists
 * @param {*} course course object to concat into users attendsCourses list 
 */
function addAttendsCourseRefToUser(course) {
  client.cache.updateQuery({query: ME}, (data) => {
    return {me: {...data.me, attendsCourses: data.me.attendsCourses.concat(course)}};
  });
}

/**
 * Appends a course object to users locally cached teachedCourses list
 * @param {*} course course object to append to teachers teaches courses list
 */
function addTeachesCourseRefToUser(course) {
  client.cache.updateQuery({query: ME}, (data) => {
    return {me: {...data.me, teachesCourses: data.me.teachesCourses.concat(course)}};
  });
}

/**
 * Appends a course object to users locally cached attendsCourses list if the logged in user has been added to a course
 * @param {*} username username of the user that was added to a course
 * @param {*} course course where the user has been added
 */
const updateAttendsListCache = (username, course) => {
  const currentUser = client.readQuery({query: ME})?.me;
  if (currentUser?.username === username) {
    addAttendsCourseRefToUser(course);
  }
};


/**
 * Removes course with unique name from cached attendsCourses list if username matches the logged in user
 * @param {*} uniqueName unique name of the course 
 * @param {*} username username of user that was removed from the course
 */
const removeCourseFromUserAttendsListCache = (uniqueName, username) => {
  const currentUser = client.readQuery({query: ME})?.me;
  if (currentUser?.username === username) {
    removeAttendsCourseRef(uniqueName);
  }
};


function freeContentBlockFromCache(client, contentBlockId) {
  evictFromCache(client, `ContentBlock:${contentBlockId}`);
}

/**
 * Removes a course from cache
 * @param {*} courseId id of the course to be removed from cache
 */
function freeCourseFromCache(courseId) {
  evictFromCache(client, `Course:${courseId}`);
}

function freeSubmissionFromCache(client, submissionId) {
  evictFromCache(client, `Submission:${submissionId}`);
}

function freeTaskFromCache(client, taskId) {
  evictFromCache(client, `Task:${taskId}`);
}

function freeInfoPageFromCache(client, infoPageId) {
  evictFromCache(client, `InfoPage:${infoPageId}`);
}

function freeChatRoomFromCache(client, chatRoomId) {
  evictFromCache(client, `ChatRoom:${chatRoomId}`);
}

function evictFromCache(client, objId) {
  client.cache.evict({id: objId});
  client.cache.gc();
}

export default {
  addAttendsCourseRefToUser,
  addChatRoomRefToCourseCache,
  addContentBlockToInfoPageCache,
  addInfoPageRefToCourseCache,
  addMessageRefToChatRoomCache,
  addSubmissionToCourseTaskCache,
  addTaskToCourseCache,
  addTeachesCourseRefToUser,
  addUserRefToChatRoomCache,
  updateAttendsListCache,
  freeChatRoomFromCache,
  freeContentBlockFromCache,
  freeCourseFromCache,
  freeInfoPageFromCache,
  freeSubmissionFromCache,
  freeTaskFromCache,
  removeAttendsCourseRef,
  removeCourseFromUserAttendsListCache,
  removeUserRefFromChatRoomCache,
};
