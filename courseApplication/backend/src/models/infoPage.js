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
        required: true,
        validate: {
            validator: function(value) {
              return /^([A-Za-z0-9])+((-?)([A-Za-z0-9]+))*$/.test(value);
            },
            message: props => `Incorrect locationUrl`
        }
    },
    contentBlocks: [contentBlockSchema]
})

module.exports = {InfoPage: mongoose.model('infoPage', infoPageSchema), infoPageSchema, ContentBlock: mongoose.model('contentBlock', contentBlockSchema)}