

const {UserInputError} = require('apollo-server-core');
const serviceUtils = require('../serviceUtils');
const {InfoPage, ContentBlock} = require('../../models/infoPage');

const addInfoPage = async (uniqueName, locationUrl, userForToken) => {
  const course = await serviceUtils.fetchCourse(uniqueName);

  serviceUtils.checkIsTeacher(course, userForToken);

  const alreadyExistingInfoPage = course.infoPages.find((page) => page.locationUrl === locationUrl);
  if (alreadyExistingInfoPage) {
    throw new UserInputError('Given page already exists');
  }

  const infoPage = {
    locationUrl: locationUrl,
    blocks: [],
  };

  const infoPageObj = new InfoPage(infoPage);
  course.infoPages.push(infoPageObj);
  await course.save();
  return infoPageObj;
};

const removeInfoPage = async (uniqueName, infoPageId, userForToken) => {
  const course = await serviceUtils.fetchCourse(uniqueName);

  serviceUtils.checkIsTeacher(course, userForToken);

  serviceUtils.findInfoPage(course, infoPageId);

  const filteredInfoPages = course.infoPages.filter((page) => page.id !== infoPageId);
  course.infoPages = filteredInfoPages;
  await course.save();
  return true;
};

const addContentBlock = async (uniqueName, infoPageId, content, position, userForToken) => {
  const course = await serviceUtils.fetchCourse(uniqueName);

  serviceUtils.checkIsTeacher(course, userForToken);

  const infoPage = serviceUtils.findInfoPage(course, infoPageId);

  const contentBlock = {
    content: content,
    position: position,
  };

  const contentBlockObj = new ContentBlock(contentBlock);
  infoPage.contentBlocks.push(contentBlockObj);
  await course.save();
  return contentBlockObj;
};

const modifyContentBlock = async (uniqueName, infoPageId, contentBlockId, newContent, userForToken) => {
  const course = await serviceUtils.fetchCourse(uniqueName);

  serviceUtils.checkIsTeacher(course, userForToken);

  const infoPage = serviceUtils.findInfoPage(course, infoPageId);

  const contentBlock = serviceUtils.findContentBlock(infoPage, contentBlockId);

  contentBlock.content = newContent;
  await course.save();
  return contentBlock;
};

const removeContentBlock = async (courseUniqueName, infoPageId, contentBlockId, userForToken) => {
  const course = await serviceUtils.fetchCourse(courseUniqueName);

  serviceUtils.checkIsTeacher(course, userForToken);

  const infoPage = serviceUtils.findInfoPage(course, infoPageId);

  const contentBlock = serviceUtils.findContentBlock(infoPage, contentBlockId);

  const filteredBlocks = infoPage.contentBlocks.filter((block) => block.id !== contentBlock.id);
  infoPage.contentBlocks = filteredBlocks;
  await course.save();
  return true;
};

module.exports = {
  addInfoPage,
  addContentBlock,
  removeContentBlock,
  removeInfoPage,
  modifyContentBlock,
};
