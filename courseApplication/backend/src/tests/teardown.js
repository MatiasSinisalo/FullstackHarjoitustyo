const {startServer} = require('../server')
const mongoose = require('mongoose')
const config = require('../config')
module.exports = async function (globalConfig, projectConfig){
    await globalThis.__SERVER__.apolloServer.stop();
    await globalThis.__SERVER__.httpServer.close();
    console.log("servers closed")

};

