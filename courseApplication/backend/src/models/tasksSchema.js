const mongoose = require('mongoose')
const { taskSchema } = require('./task')

//schema to be stored as a courses subdocument
//will store arrays of different types of task
const tasksSchema = new mongoose.Schema({
    textTasks: [taskSchema]
    //multipleChoiceTasks: [multipleChoiceTasksSchema]
})

module.exports = mongoose.model("tasksSchema", tasksSchema)