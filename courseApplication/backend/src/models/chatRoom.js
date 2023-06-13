const mongoose = require("mongoose")


const messageSchema = new mongoose.Schema({
    fromUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'courseApplicationUser',
        required: true
    },
    sendDate: {
        type: Date,
        required: true
    },
    content: {
        type: String,
        required: true
    }
})

const chatRoomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'courseApplicationUser',
        required: true
    },
    users: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'courseApplicationUser'
        }]
    },
    messages: [messageSchema]
})

module.exports = {ChatRoom: mongoose.model("chatRoom", chatRoomSchema), chatRoomSchema, Message: mongoose.model("message", messageSchema), messageSchema}