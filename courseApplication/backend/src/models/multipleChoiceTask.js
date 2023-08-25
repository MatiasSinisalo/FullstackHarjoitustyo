const mongoose = require("mongoose")



const multipleChoiceTaskSchema = new mongoose.Schema({

})


module.exports = {MultipleChoiceTask : mongoose.model("multipleChoiceTask", multipleChoiceTaskSchema), multipleChoiceTaskSchema}