const mongoose = require('mongoose')
const { infoPageSchema } = require('./infoPage')
const { isValidAsUrl } = require('../regex')
const { chatRoomSchema } = require('./chatRoom')
const tasksSchema = require('./tasks')
const courseSchema = new mongoose.Schema({
    uniqueName: {
        type: String,
        required: true,
        unique: true,
        validate:{
            validator: (value) => {
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
    tasks: tasksSchema,
    infoPages: [infoPageSchema],
    chatRooms: [chatRoomSchema]
})

module.exports = {Course: mongoose.model('courseApplicationCourse', courseSchema), courseSchema}

