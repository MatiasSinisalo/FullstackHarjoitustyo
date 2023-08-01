import { ME } from "../queries/userQueries"
import { GET_COURSE } from "../queries/courseQueries"

function removeUserRefFromChatRoomCache(client, chatRoomId, userToRemove) {
    client.cache.modify(
        {
            id: `ChatRoom:${chatRoomId}`,
            fields: {
                users(currentUsers) {
                    return currentUsers.filter((userRef) => userRef.__ref !== `User:${userToRemove.id}`)
                }
            }
        }
    )
}

function addUserRefToChatRoomCache(client, chatRoomId, user) {
    client.cache.modify(
        {
            id: `ChatRoom:${chatRoomId}`,
            fields: {
                users(currentUsers) {
                    return currentUsers.concat({ __ref: `User:${user.id}` })
                }
            }
        }
    )
}

function addMessageRefToChatRoomCache(client, chatRoomId, message) {
    client.cache.modify(
        {
            id: `ChatRoom:${chatRoomId}`,
            fields: {
                messages(currentMessages) {
                    return currentMessages.concat({ __ref: `Message:${message.id}` })
                }
            }
        }
    )
}

function freeChatRoomFromCache(client, chatRoomId) {
    client.cache.evict({ id: `ChatRoom:${chatRoomId}` })
    client.cache.gc()
}

function addChatRoomRefToCourseCache(client, courseUniqueName, result) {
    const course = client.readQuery({ query: GET_COURSE, variables: { uniqueName: courseUniqueName } }).getCourse
    const chatRoom = result.data.createChatRoom
    client.cache.modify({
        id: `Course:${course.id}`,
        fields: {
            chatRooms(currentRooms) {
                return currentRooms.concat({ __ref: `ChatRoom:${chatRoom.id}` })
            }
        }
    })
}

function freeContentBlockFromCache(client, contentBlockId) {
    client.cache.evict({ id: `ContentBlock:${contentBlockId}` })
    client.cache.gc()
}

function addContentBlockToInfoPageCache(result, client, pageId) {
    const contentBlock = result.data.addContentBlockToInfoPage
    client.cache.modify({
        id: `InfoPage:${pageId}`,
        fields: {
            contentBlocks(cachedContentBlocks) {
                return cachedContentBlocks.concat({ __ref: `ContentBlock:${contentBlock.id}` })
            }
        }
    })
}

function freeInfoPageFromCache(client, infoPageId) {
    client.cache.evict({ id: `InfoPage:${infoPageId}` })
    client.cache.gc()
}

function addInfoPageRefToCourseCache(client, courseUniqueName, result) {
    const course = client.readQuery({ query: GET_COURSE, variables: { uniqueName: courseUniqueName } }).getCourse
    client.cache.modify({
        id: client.cache.identify(course),
        fields: {
            infoPages(pages) {
                return pages.concat({ __ref: `InfoPage:${result.data.addInfoPageToCourse.id}` })
            }
        }
    })
}

function freeSubmissionFromCache(client, submissionId) {
    client.cache.evict({ id: `Submission:${submissionId}` })
    client.cache.gc()
}

function freeTaskFromCache(client, taskId) {
    client.cache.evict({ id: `Task:${taskId}` })
    client.cache.gc()
}

function addSubmissionToCourseTaskCache(client, taskId, newSubmission) {
    client.cache.modify({
        id: `Task:${taskId}`,
        fields: {
            submissions(cachedSubmissions) {
                return cachedSubmissions.concat({ __ref: `Submission:${newSubmission.id}` })
            }
        }
    })
}

function addTaskToCourseCache(apolloClient, uniqueName, result) {
    const course = apolloClient.readQuery({ query: GET_COURSE, variables: { uniqueName: uniqueName } }).getCourse
    apolloClient.cache.modify({
        id: apolloClient.cache.identify(course),
        fields: {
            tasks(cachedTasks) {
                console.log(cachedTasks)
                return cachedTasks.concat({ __ref: `Task:${result.data.addTaskToCourse.id}` })
            }
        }
    })
}

function removeAttendsCourseRef(apolloClient, uniqueName) {
    apolloClient.cache.updateQuery({ query: ME }, (data) => {
        return { me: { ...data.me, attendsCourses: data.me.attendsCourses.filter((course) => course.uniqueName != uniqueName) } }
    })
}

function addAttendsCourseRefToUser(apolloClient, course) {
    apolloClient.cache.updateQuery({ query: ME }, (data) => {
        return { me: { ...data.me, attendsCourses: data.me.attendsCourses.concat(course) } }
    })
}

function freeCourseFromCache(apolloClient, course) {
    apolloClient.cache.evict({ id: `Course:${course.id}` })
    apolloClient.cache.gc()
}

function addTeachesCourseRefToUser(apolloClient, course) {
    apolloClient.cache.updateQuery({ query: ME }, (data) => {
        return { me: { ...data.me, teachesCourses: data.me.teachesCourses.concat(course) } }
    })
}

const addUserToUserAttendsListCache = (username, course, apolloClient) => {
    const currentUser = apolloClient.readQuery({query: ME})?.me
    if(currentUser?.username === username)
    {
        addAttendsCourseRefToUser(apolloClient, course)
    }
}

const removeCourseFromUserAttendsListCache = (uniqueName, username, apolloClient) => {
    const currentUser = apolloClient.readQuery({query: ME})?.me
    if(currentUser?.username === username)
    {
        apolloCache.removeAttendsCourseRef(apolloClient, uniqueName)
    }
}

export default {
    addAttendsCourseRefToUser, 
    addChatRoomRefToCourseCache, 
    addContentBlockToInfoPageCache,
    addInfoPageRefToCourseCache,
    addMessageRefToChatRoomCache,
    addSubmissionToCourseTaskCache,
    addTaskToCourseCache,
    addTeachesCourseRefToUser,
    addUserRefToChatRoomCache,
    addUserToUserAttendsListCache,
    freeChatRoomFromCache,
    freeContentBlockFromCache,
    freeCourseFromCache,
    freeInfoPageFromCache,
    freeSubmissionFromCache,
    freeTaskFromCache,
    removeAttendsCourseRef,
    removeCourseFromUserAttendsListCache,
    removeUserRefFromChatRoomCache
}
