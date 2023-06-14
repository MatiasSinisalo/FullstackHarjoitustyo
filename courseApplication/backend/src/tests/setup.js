const {startServer} = require('../server')
const mongoose = require('mongoose')
const config = require('../config')
module.exports = async function (globalConfig, projectConfig){
    const server = await startServer()
    console.log("hello from setup")
    globalThis.__SERVER__ = server;
};

