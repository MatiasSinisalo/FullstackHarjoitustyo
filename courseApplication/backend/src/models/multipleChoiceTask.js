const mongoose = require("mongoose")

const multipleChoiceTaskQuestionSchema = new mongoose.Schema({
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

const multipleChoiceTaskAnswerChoiceSchema = new mongoose.Schema({
    option: {type: mongoose.Schema.Types.ObjectId, ref: "multipleChoiceTaskQuestion", required: true},
    selected: {type: Boolean, required: true}
})


const multipleChoiceTaskAnswerSchema = new mongoose.Schema({
    fromUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'courseApplicationUser',
    },
    choices: [multipleChoiceTaskAnswerChoiceSchema],
})



const multipleChoiceTaskSchema = new mongoose.Schema({
    description: {
        type: String
    },
    deadline: {
        type: Date
    },
    questions: [multipleChoiceTaskQuestionSchema],
    answers: [multipleChoiceTaskAnswerSchema]
})


module.exports = {
    MultipleChoiceTask : mongoose.model("multipleChoiceTask", multipleChoiceTaskSchema), multipleChoiceTaskSchema,
    multipleChoiceTaskQuestion: mongoose.model("multipleChoiceTaskQuestion", multipleChoiceTaskQuestionSchema), multipleChoiceTaskQuestionSchema,
    multipleChoiceTaskAnswer: mongoose.model("multipleChoiceTaskAnswer", multipleChoiceTaskAnswerSchema), multipleChoiceTaskAnswerSchema
}