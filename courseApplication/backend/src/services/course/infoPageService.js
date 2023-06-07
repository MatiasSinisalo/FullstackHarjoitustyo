


const { UserInputError } = require('apollo-server-core')

const Course = require('../../models/course')
const { default: mongoose } = require('mongoose')
const { Task, Submission, Grade } = require('../../models/task')
const serviceUtils = require('../serviceUtils')
const { InfoPage, ContentBlock } = require('../../models/infoPage')


const addInfoPage = async (uniqueName, locationUrl, userForToken) => {
    const course =  await serviceUtils.fetchCourse(uniqueName)
    
    if(course.teacher.toString() !== userForToken.id)
    {
        throw new UserInputError("Unauthorized")
    }

    const alreadyExistingInfoPage = course.infoPages.find((page) => page.locationUrl === locationUrl)
    if(alreadyExistingInfoPage)
    {
        throw new UserInputError("Given page already exists")
    }

    const infoPage = {
        locationUrl: locationUrl,
        blocks: []
    }

    const infoPageObj = new InfoPage(infoPage)
    course.infoPages.push(infoPageObj)
    await course.save()
    return infoPageObj
}

const addContentBlock = async (uniqueName, infoPageId, content, position, userForToken) => {
    const course =  await serviceUtils.fetchCourse(uniqueName)
    
    if(course.teacher.toString() !== userForToken.id)
    {
        throw new UserInputError("Unauthorized")
    }

    const infoPage = course.infoPages.find((page) => page.id === infoPageId)
    if(!infoPage)
    {
        throw new UserInputError("Given info page not found")
    }

    const contentBlock = {
        content: content,
        position: position
    }

    const contentBlockObj = new ContentBlock(contentBlock)
    infoPage.contentBlocks.push(contentBlockObj)
    await course.save()
    return contentBlockObj
}


module.exports = {
    addInfoPage,
    addContentBlock
}