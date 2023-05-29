const { UserInputError } = require('apollo-server-core')

const Course = require('../../models/course')
const { default: mongoose } = require('mongoose')
const { Task, Submission, Grade } = require('../../models/task')
const serviceUtils = require('../serviceUtils')

const addTaskToCourse = async (courseUniqueName, taskDescription, deadline, userForToken) => {
    const course = await serviceUtils.fetchCourse(courseUniqueName)
    //only teacher should be able to add a task to the course
    if(userForToken.id !== course.teacher.toString())
    {
        throw new UserInputError("Unauthorized")
    }

    const newTask = {
        id: mongoose.Types.ObjectId(),
        description: taskDescription,
        deadline: new Date(deadline),
        submissions: []
    }

    const taskObj = new Task(newTask)
    course.tasks.push(taskObj)
    await course.save()
   
    return taskObj
}

const removeTaskFromCourse = async (courseUniqueName, taskId, userForToken) =>{
    const course = await serviceUtils.fetchCourse(courseUniqueName)
  
    if(course.teacher.toString() !== userForToken.id)
    {
        throw new UserInputError("Unauthorized")
    }

    
    const task = serviceUtils.findTask(course, taskId)

    const updatedTaskList = course.tasks.filter((task) => task.id != taskId)
    await Course.findByIdAndUpdate(course.id, {tasks: updatedTaskList}, {new: true})
    return true
}




module.exports = {  
                    addTaskToCourse, 
                    removeTaskFromCourse,
                }