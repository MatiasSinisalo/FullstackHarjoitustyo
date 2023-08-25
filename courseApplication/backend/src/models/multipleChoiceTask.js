const mongoose = require("mongoose")

const multipleChoiceTaskAnswerSchema = new mongoose.Schema({
    
})

multipleChoiceTaskQuestion = new mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    isCorrect: {
        type: Boolean,
        required: true
    },
    points: {
        type: Number
    }
})

const multipleChoiceTaskSchema = new mongoose.Schema({
    description: {
        type: String
    },
    deadline: {
        type: Date
    },
    questions: [multipleChoiceTaskQuestion],
    answers: [multipleChoiceTaskAnswerSchema]
})


module.exports = {MultipleChoiceTask : mongoose.model("multipleChoiceTask", multipleChoiceTaskSchema), multipleChoiceTaskSchema}