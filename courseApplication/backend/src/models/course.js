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
        ref: 'courseApplicationUser'
    },
    students: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'courseApplicationUser'
        }]
    }
})

module.exports = mongoose.model('courseApplicationCourse', courseSchema)

