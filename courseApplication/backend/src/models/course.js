const mongoose = require('mongoose')





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
    tasks: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'courseApplicationTask'
        }]
    }
})

module.exports = mongoose.model('courseApplicationCourse', courseSchema)

