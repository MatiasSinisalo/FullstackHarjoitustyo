
const User = require('./models/user')
const {Course} = require('./models/course')
const config = require('./config')
const userResolvers = require('./resolvers/userResolvers')
const courseResolvers = require('./resolvers/courseResolvers')
const Task = require('./models/task')

const {pubsub} = require('./publisher')
const resolvers  = {
    Query: {
        ...userResolvers.userQueryResolvers,
        ...courseResolvers.courseQueryResolvers
    },
    Mutation: {
        ...userResolvers.userMutationResolvers,
        ...courseResolvers.courseMutationResolvers,
        reset: async(root, args, context) => {
            if(config.IS_TEST)
            {
                await Course.deleteMany({})
                await User.deleteMany({})
                return true
            }
            else
            {
                return false
            }
        },
    },
    Subscription: {
        ...courseResolvers.courseSubscriptionResolvers
    }
}


module.exports = resolvers