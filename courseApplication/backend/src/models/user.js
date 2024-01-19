const mongoose = require('mongoose')





const userSchema = new mongoose.Schema({
    accountType: {
      type: String,
      enum: ['normal', 'google'],
      default: 'normal',
      required: true
    },
    thirdPartyID: {
        type: String,
        unique: true,
    },
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
