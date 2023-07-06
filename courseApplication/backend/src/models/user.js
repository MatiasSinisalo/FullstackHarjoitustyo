const mongoose = require('mongoose')


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    teachesCourses: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'courseApplicationCourse'
        }]
    },
    attendsCourses: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'courseApplicationCourse'
        }]
    },
})


module.exports = mongoose.model('courseApplicationUser', userSchema)
