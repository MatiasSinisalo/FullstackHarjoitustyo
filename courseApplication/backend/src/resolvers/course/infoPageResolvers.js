
const courseService = require('../../services/courseService')
const { mustHaveToken } = require('../resolverUtils')


const infoPageResolvers = {
    addInfoPageToCourse: async(root, args, context) => {
        mustHaveToken(context)
        const courseUniqueName = args.courseUniqueName
        const locationUrl = args.locationUrl
        const newInfoPage = await courseService.infoPages.addInfoPage(courseUniqueName, locationUrl, context.userForToken)
        return newInfoPage
    },
    removeInfoPageFromCourse: async(root, args, context) => {
        mustHaveToken(context)
        const courseUniqueName = args.courseUniqueName
        const infoPageId = args.infoPageId
        const removed = await courseService.infoPages.removeInfoPage(courseUniqueName, infoPageId, context.userForToken)
        return removed
    },
    addContentBlockToInfoPage: async(root, args, context) => {
        mustHaveToken(context)
        const courseUniqueName = args.courseUniqueName
        const infoPageId = args.infoPageId
        const content = args.content
        const position = args.position
        const newContentBloc = await courseService.infoPages.addContentBlock(courseUniqueName, infoPageId, content, position, context.userForToken)
        return newContentBloc
    },
    modifyContentBlock: async(root, args, context) => {
        mustHaveToken(context)
        const courseUniqueName = args.courseUniqueName
        const infoPageId = args.infoPageId
        const contentBlockId = args.contentBlockId
        const content = args.content
        const modifiedContentBlock = await courseService.infoPages.modifyContentBlock(courseUniqueName, infoPageId, contentBlockId, content, context.userForToken)
        return modifiedContentBlock
    },
    removeContentBlockFromInfoPage: async(root, args, context) => {
        mustHaveToken(context)
        const courseUniqueName = args.courseUniqueName
        const infoPageId = args.infoPageId
        const contentBlockId = args.contentBlockId
        const removed = await courseService.infoPages.removeContentBlock(courseUniqueName, infoPageId, contentBlockId, context.userForToken)
        return removed

    },
}

module.exports = {infoPageResolvers}