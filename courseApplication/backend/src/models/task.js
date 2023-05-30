const mongoose = require('mongoose')

const gradeSchema = new mongoose.Schema({
    points: {
        type: Number
    },
    date: {
        type: Date
    }
})

const submissionSchema = new mongoose.Schema({
    fromUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'courseApplicationUser',
    },
    content: {
        type: String
    },
    grade: gradeSchema,
    submitted:{
        type: Boolean
    },
    submittedDate:{
        type: Date
    }
})

const taskSchema = new mongoose.Schema({
    description: {
        type: String
    },
    deadline: {
        type: Date
    },
    maxGrade: {
        type: Number
    },
    submissions: {
        type: [submissionSchema]
    }
})


module.exports = {Task: mongoose.model('courseApplicationTask', taskSchema), taskSchema, Submission: mongoose.model('taskSubmission', submissionSchema), Grade: mongoose.model('submissionGrade', gradeSchema)}
