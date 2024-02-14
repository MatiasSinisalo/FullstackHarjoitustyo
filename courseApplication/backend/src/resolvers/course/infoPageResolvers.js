
const infoPageService = require('../../services/course/infoPageService');
const {mustHaveToken} = require('../resolverUtils');


const infoPageResolvers = {
  addInfoPageToCourse: async (root, args, context) => {
    mustHaveToken(context);
    const courseUniqueName = args.courseUniqueName;
    const locationUrl = args.locationUrl;
    const newInfoPage = await infoPageService.addInfoPage(courseUniqueName, locationUrl, context.userForToken);
    return newInfoPage;
  },
  removeInfoPageFromCourse: async (root, args, context) => {
    mustHaveToken(context);
    const courseUniqueName = args.courseUniqueName;
    const infoPageId = args.infoPageId;
    const removed = await infoPageService.removeInfoPage(courseUniqueName, infoPageId, context.userForToken);
    return removed;
  },
  addContentBlockToInfoPage: async (root, args, context) => {
    mustHaveToken(context);
    const courseUniqueName = args.courseUniqueName;
    const infoPageId = args.infoPageId;
    const content = args.content;
    const position = args.position;
    const newContentBloc = await infoPageService.addContentBlock(courseUniqueName, infoPageId, content, position, context.userForToken);
    return newContentBloc;
  },
  modifyContentBlock: async (root, args, context) => {
    mustHaveToken(context);
    const courseUniqueName = args.courseUniqueName;
    const infoPageId = args.infoPageId;
    const contentBlockId = args.contentBlockId;
    const content = args.content;
    const modifiedContentBlock = await infoPageService.modifyContentBlock(courseUniqueName, infoPageId, contentBlockId, content, context.userForToken);
    return modifiedContentBlock;
  },
  removeContentBlockFromInfoPage: async (root, args, context) => {
    mustHaveToken(context);
    const courseUniqueName = args.courseUniqueName;
    const infoPageId = args.infoPageId;
    const contentBlockId = args.contentBlockId;
    const removed = await infoPageService.removeContentBlock(courseUniqueName, infoPageId, contentBlockId, context.userForToken);
    return removed;
  },
};

module.exports = {infoPageResolvers};
