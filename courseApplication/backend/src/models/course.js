const mongoose = require('mongoose')
const { taskSchema } = require('./task')
const { infoPageSchema } = require('./infoPage')
const { isValidAsUrl } = require('../services/serviceUtils')

const courseSchema = new mongoose.Schema({
    uniqueName: {
        type: String,
        required: true,
        unique: true,
        validate:{
            validator: () => {
                return isValidAsUrl(value)
            },
            message: props => `Incorrect unique name`
           
        }
    },
    name: {
        type: String,
        required: true
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'courseApplicationUser',
        required: true
    },
    students: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'courseApplicationUser'
        }]
    },
    tasks: [taskSchema],
    infoPages: [infoPageSchema]
})

module.exports = mongoose.model('courseApplicationCourse', courseSchema)

