


const { UserInputError } = require('apollo-server-core')

const Course = require('../../models/course')
const { default: mongoose } = require('mongoose')
const { Task, Submission, Grade } = require('../../models/task')
const serviceUtils = require('../serviceUtils')


const addInfoPage = (uniqueName, locationUrl, userForToken) => {
    return null
}


module.exports = {addInfoPage}