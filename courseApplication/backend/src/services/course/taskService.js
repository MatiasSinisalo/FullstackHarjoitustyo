const { UserInputError } = require('apollo-server-core')

const {Course} = require('../../models/course')
const { default: mongoose } = require('mongoose')
const { Task, Submission, Grade } = require('../../models/task')
const serviceUtils = require('../serviceUtils')



const addTaskToCourse = async (courseUniqueName, taskDescription, deadline, maxGrade, userForToken) => {
    const course = await serviceUtils.fetchCourse(courseUniqueName)
    //only teacher should be able to add a task to the course
    serviceUtils.checkIsTeacher(course, userForToken)

    const validatedDeadline = serviceUtils.validateDate(deadline)
    const newTask = {
        id: mongoose.Types.ObjectId(),
        description: taskDescription,
        deadline: validatedDeadline,
        maxGrade: maxGrade,
        submissions: []
    }

    const taskObj = new Task(newTask)
    course.tasks.textTasks.push(taskObj)
    await course.save()
   
    return taskObj
}

const removeTaskFromCourse = async (courseUniqueName, taskId, userForToken) =>{
    const course = await serviceUtils.fetchCourse(courseUniqueName)
  
    serviceUtils.checkIsTeacher(course, userForToken)
    
    const task = serviceUtils.findTask(course, taskId)

    const updatedTaskList = course.tasks.textTasks.filter((task) => task.id != taskId)
    course.tasks.textTasks = updatedTaskList
    await course.save()
    return true
}




module.exports = {  
                    addTaskToCourse, 
                    removeTaskFromCourse,
                }