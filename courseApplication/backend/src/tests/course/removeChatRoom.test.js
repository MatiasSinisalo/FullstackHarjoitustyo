

const {Course} = require('../../models/course');
const {removeChatRoom} = require('../courseTestQueries');
const helpers = require('../testHelpers');


const checkCourseHasChatRoom = async (chatRoom) => {
  const coursesInDB = await Course.find({});
  expect(coursesInDB.length).toBe(1);
  const courseInDB = coursesInDB[0];
  expect(courseInDB.chatRooms.length).toBe(1);
};

describe('removeChatRoom tests', () => {
  test('removeChatRoom removes chat room correctly', async () => {
    await helpers.logIn('username');
    const course = await helpers.createCourse('courseUniqueName', 'name', []);
    const chatRoom = await helpers.createChatRoom(course, 'room');

    const removeChatRoomQuery = await helpers.makeQuery({query: removeChatRoom,
      variables: {courseUniqueName: course.uniqueName, chatRoomId: chatRoom.id}});
    expect(removeChatRoomQuery.data.removeChatRoom).toBe(true);

    const coursesInDB = await Course.find({});
    expect(coursesInDB.length).toBe(1);
    const courseInDB = coursesInDB[0];
    expect(courseInDB.chatRooms.length).toBe(0);
  });
  test('removeChatRoom returns Unauthorized if user is not teacher', async () => {
    await helpers.logIn('username');
    const course = await helpers.createCourse('courseUniqueName', 'name', []);
    const chatRoom = await helpers.createChatRoom(course, 'room');

    await helpers.logIn('students username');
    const removeChatRoomQuery = await helpers.makeQuery({query: removeChatRoom,
      variables: {courseUniqueName: course.uniqueName, chatRoomId: chatRoom.id}});
    expect(removeChatRoomQuery.data.removeChatRoom).toBe(null);
    expect(removeChatRoomQuery.errors[0].message).toBe('Unauthorized');

    await checkCourseHasChatRoom(chatRoom);
  });
  test('removeChatRoom returns given course not found if course is not found', async () => {
    await helpers.logIn('username');
    const course = await helpers.createCourse('courseUniqueName', 'name', []);
    const chatRoom = await helpers.createChatRoom(course, 'room');

    const removeChatRoomQuery = await helpers.makeQuery({query: removeChatRoom,
      variables: {courseUniqueName: 'doesNotExist', chatRoomId: chatRoom.id}});
    expect(removeChatRoomQuery.data.removeChatRoom).toBe(null);
    expect(removeChatRoomQuery.errors[0].message).toBe('Given course not found');

    await checkCourseHasChatRoom(chatRoom);
  });
  test('removeChatRoom returns given chatroom not found if chatRoom is not found', async () => {
    await helpers.logIn('username');
    const course = await helpers.createCourse('courseUniqueName', 'name', []);
    const chatRoom = await helpers.createChatRoom(course, 'room');

    const removeChatRoomQuery = await helpers.makeQuery({query: removeChatRoom,
      variables: {courseUniqueName: course.uniqueName, chatRoomId: 'abd1234'}});
    expect(removeChatRoomQuery.data.removeChatRoom).toBe(null);
    expect(removeChatRoomQuery.errors[0].message).toBe('Given chatroom not found');

    await checkCourseHasChatRoom(chatRoom);
  });
});
