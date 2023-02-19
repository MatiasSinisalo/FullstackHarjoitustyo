const mongoose = require('mongoose')

const submission = {
    fromUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'courseApplicationUser',
    },
    content: {
        type: String
    },
    submitted:{
        type: Boolean
    }
}

const task = {
    description: {
        type: String
    },
    deadline: {
        type: Date
    },
    submissions: {
        type: [submission]
    }
}


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
        type: [task]
    }
})

module.exports = mongoose.model('courseApplicationCourse', courseSchema)

