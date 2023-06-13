const mongoose = require("mongoose")

const chatRoomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'courseApplicationUser'
    },
    users: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'courseApplicationUser'
        }]
    },
    messages: []
})

module.exports = {ChatRoom: mongoose.model("chatRoom", chatRoomSchema), chatRoomSchema}