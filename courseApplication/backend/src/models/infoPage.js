const mongoose = require('mongoose')
const { taskSchema } = require('./task')


const contentBlockSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    position: {
        type: Number,
        required: true
    }
})

const infoPageSchema = new mongoose.Schema({
    locationUrl: {
        type: String,
        required: true
    },
    contentBlocks: [contentBlockSchema]
})

module.exports = {InfoPage: mongoose.model('infoPage', infoPageSchema), ContentBlock: mongoose.model('contentBlock', contentBlockSchema)}