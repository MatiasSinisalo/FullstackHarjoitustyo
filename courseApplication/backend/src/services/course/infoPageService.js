


const { UserInputError } = require('apollo-server-core')

const Course = require('../../models/course')
const { default: mongoose } = require('mongoose')
const { Task, Submission, Grade } = require('../../models/task')
const serviceUtils = require('../serviceUtils')
const { InfoPage } = require('../../models/infoPage')


const addInfoPage = async (uniqueName, locationUrl, userForToken) => {
    const course =  await serviceUtils.fetchCourse(uniqueName)
    
    if(!course.teacher.toString() === userForToken.id)
    {
        throw new UserInputError("Unauthorized!")
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


module.exports = {addInfoPage}