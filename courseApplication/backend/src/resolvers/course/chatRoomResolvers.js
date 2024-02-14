const {mustHaveToken} = require('../resolverUtils');
const {pubsub} = require('../../publisher');
const {withFilter} = require('graphql-subscriptions');
const chatRoomService = require('../../services/course/chatRoomService');


const chatRoomResolvers = {
  createChatRoom: async (root, args, context) => {
    mustHaveToken(context);
    const courseUniqueName = args.courseUniqueName;
    const name = args.name;
    const newChatRoom = await chatRoomService.createChatRoom(courseUniqueName, name, context.userForToken);
    return newChatRoom;
  },
  addUserToChatRoom: async (root, args, context) => {
    mustHaveToken(context);
    const courseUniqueName = args.courseUniqueName;
    const chatRoomId = args.chatRoomId;
    const username = args.username;
    const added = await chatRoomService.addUserToChatRoom(courseUniqueName, chatRoomId, username, context.userForToken);
    return added;
  },
  removeUserFromChatRoom: async (root, args, context) => {
    mustHaveToken(context);
    const courseUniqueName = args.courseUniqueName;
    const chatRoomId = args.chatRoomId;
    const username = args.username;
    const removed = await chatRoomService.removeUserFromChatRoom(courseUniqueName, chatRoomId, username, context.userForToken);
    return removed;
  },
  removeChatRoom: async (root, args, context) => {
    mustHaveToken(context);
    const courseUniqueName = args.courseUniqueName;
    const chatRoomId = args.chatRoomId;
    const removed = await chatRoomService.removeChatRoom(courseUniqueName, chatRoomId, context.userForToken);
    return removed;
  },
  createMessage: async (root, args, context) => {
    mustHaveToken(context);
    const courseUniqueName = args.courseUniqueName;
    const chatRoomId = args.chatRoomId;
    const content = args.content;
    const newMessage = await chatRoomService.createMessage(courseUniqueName, chatRoomId, content, context.userForToken);
    pubsub.publish('MESSAGE_CREATED', {messageCreated: {...newMessage, sendDate: newMessage.sendDate.getTime().toString()}, information: {courseUniqueName, chatRoomId}});
    return newMessage;
  },
};

const chatRoomSubscriptionResolvers = {
  // using subscriptions with a withFilter function:
  // https://www.apollographql.com/docs/apollo-server/data/subscriptions/
  messageCreated: {
    async subscribe(root, args, context) {
      mustHaveToken(context);
      const courseUniqueName = args.courseUniqueName;
      const chatRoomId = args.chatRoomId;
      await chatRoomService.checkCanSubscribeToMessageCreated(courseUniqueName, chatRoomId, context.userForToken);

      // very important, Do not forget to return withFilter(...)(root, args, context) because otherwise it will give the folowwing error:
      // Error: Subscription field must return Async Iterable
      // credits: https://github.com/apollographql/graphql-subscriptions/issues/161
      return withFilter(
          () => pubsub.asyncIterator('MESSAGE_CREATED'),
          async (payload, args, context) => {
            return Boolean(payload.information.chatRoomId === args.chatRoomId);
          },
      )(root, args, context);
    },
  },
};

module.exports = {chatRoomResolvers, chatRoomSubscriptionResolvers};
