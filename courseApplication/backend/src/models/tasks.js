const mongoose = require('mongoose')
const { taskSchema } = require('./task')
const { multipleChoiceTaskSchema } = require('./multipleChoiceTask')

//schema to be stored as a courses subdocument
//will store arrays of different types of task
const tasksSchema = new mongoose.Schema({
    textTasks: [taskSchema],
    multipleChoiceTasks: [multipleChoiceTaskSchema]
})

module.exports = {Tasks: mongoose.model("tasksSchema", tasksSchema), tasksSchema}