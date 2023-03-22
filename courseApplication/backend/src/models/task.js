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

const taskSchema = new mongoose.Schema({
    description: {
        type: String
    },
    deadline: {
        type: Date
    },
    submissions: {
        type: [submission]
    }
})


module.exports = {Task: mongoose.model('courseApplicationTask', taskSchema), taskSchema}
