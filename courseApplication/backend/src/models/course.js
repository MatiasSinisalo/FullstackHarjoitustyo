const mongoose = require('mongoose')
const { taskSchema } = require('./task')

const courseSchema = new mongoose.Schema({
    uniqueName: {
        type: String,
        required: true,
        unique: true
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
    tasks: [taskSchema]
})

module.exports = mongoose.model('courseApplicationCourse', courseSchema)

