const mongoose = require('mongoose')
const submissionSchema = new mongoose.Schema({
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
})

const taskSchema = new mongoose.Schema({
    description: {
        type: String
    },
    deadline: {
        type: Date
    },
    submissions: {
        type: [submissionSchema]
    }
})


module.exports = {Task: mongoose.model('courseApplicationTask', taskSchema), taskSchema, Submission: mongoose.model('taskSubmission', submissionSchema)}
