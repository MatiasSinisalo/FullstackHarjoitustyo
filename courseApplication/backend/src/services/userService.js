const User = require('../models/user')
const bcrypt = require('bcrypt')


    const createNewUser = async (username, name, password) => {
                const newUser = {
                    username: username,
                    name: name,
                    password: password
                }

                const hashedPassword = await bcrypt.hash(newUser.username, 10)
                const userToSave = {
                    username: newUser.username,
                    name: newUser.name,
                    passwordHash: hashedPassword
                }

                const userObj = User(userToSave)
                await userObj.save()

                delete(newUser.password)
                console.log(newUser)
                return newUser
    }



module.exports = {createNewUser}