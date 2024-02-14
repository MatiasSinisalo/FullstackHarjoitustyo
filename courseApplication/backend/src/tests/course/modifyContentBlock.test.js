

const {Course} = require('../../models/course');
const {modifyContentBlock} = require('../courseTestQueries');
const helpers = require('../testHelpers');


const checkContentBlockContent = async (content) => {
  const coursesInDB = await Course.find({});
  expect(coursesInDB.length).toBe(1);

  const courseInDB = coursesInDB[0];
  expect(courseInDB.infoPages.length).toBe(1);

  const infoPageInDB = courseInDB.infoPages[0];
  expect(infoPageInDB.contentBlocks.length).toBe(1);

  const contentBlockInDB = infoPageInDB.contentBlocks[0];
  expect(contentBlockInDB.content).toEqual(content);
};

describe('modifyContentBlock tests', () => {
  test('modifyContentBlock modifies content block content correctly', async () => {
    await helpers.logIn('username');
    const course = await helpers.createCourse('unique-name', 'name', []);
    const infopage = await helpers.createInfoPage(course, 'page-url');
    const contentBlock = await helpers.createContentBlock(course, infopage, 'this is some text', 0);

    const newContent = 'this is modified content';
    const contentBlockEditQuery = await helpers.makeQuery({query: modifyContentBlock,
      variables: {courseUniqueName: course.uniqueName, infoPageId: infopage.id, contentBlockId: contentBlock.id, content: newContent}});
    expect(contentBlockEditQuery.data.modifyContentBlock.content).toEqual(newContent);

    await checkContentBlockContent(newContent);
  });

  test('modifyContentBlock modifies returns Unauthorized if user is not teacher', async () => {
    await helpers.logIn('username');
    const course = await helpers.createCourse('unique-name', 'name', []);
    const infopage = await helpers.createInfoPage(course, 'page-url');
    const contentBlock = await helpers.createContentBlock(course, infopage, 'this is some text', 0);

    const newContent = 'this is modified content';
    await helpers.logIn('students username');
    const contentBlockEditQuery = await helpers.makeQuery({query: modifyContentBlock,
      variables: {courseUniqueName: course.uniqueName, infoPageId: infopage.id, contentBlockId: contentBlock.id, content: newContent}});
    expect(contentBlockEditQuery.data.modifyContentBlock).toEqual(null);
    expect(contentBlockEditQuery.errors[0].message).toEqual('Unauthorized');

    await checkContentBlockContent(contentBlock.content);
  });

  test('modifyContentBlock modifies returns Given course not found if course is not found', async () => {
    await helpers.logIn('username');
    const course = await helpers.createCourse('unique-name', 'name', []);
    const infopage = await helpers.createInfoPage(course, 'page-url');
    const contentBlock = await helpers.createContentBlock(course, infopage, 'this is some text', 0);

    const newContent = 'this is modified content';
    const contentBlockEditQuery = await helpers.makeQuery({query: modifyContentBlock,
      variables: {courseUniqueName: 'does not exist', infoPageId: infopage.id, contentBlockId: contentBlock.id, content: newContent}});
    expect(contentBlockEditQuery.data.modifyContentBlock).toEqual(null);
    expect(contentBlockEditQuery.errors[0].message).toEqual('Given course not found');

    await checkContentBlockContent(contentBlock.content);
  });

  test('modifyContentBlock modifies returns Given info page not found if page is not found', async () => {
    await helpers.logIn('username');
    const course = await helpers.createCourse('unique-name', 'name', []);
    const infopage = await helpers.createInfoPage(course, 'page-url');
    const contentBlock = await helpers.createContentBlock(course, infopage, 'this is some text', 0);

    const newContent = 'this is modified content';
    const contentBlockEditQuery = await helpers.makeQuery({query: modifyContentBlock,
      variables: {courseUniqueName: course.uniqueName, infoPageId: 'abc1234', contentBlockId: contentBlock.id, content: newContent}});
    expect(contentBlockEditQuery.data.modifyContentBlock).toEqual(null);
    expect(contentBlockEditQuery.errors[0].message).toEqual('Given info page not found');

    await checkContentBlockContent(contentBlock.content);
  });

  test('modifyContentBlock modifies returns Given content block not found if content block is not found', async () => {
    await helpers.logIn('username');
    const course = await helpers.createCourse('unique-name', 'name', []);
    const infopage = await helpers.createInfoPage(course, 'page-url');
    const contentBlock = await helpers.createContentBlock(course, infopage, 'this is some text', 0);

    const newContent = 'this is modified content';
    const contentBlockEditQuery = await helpers.makeQuery({query: modifyContentBlock,
      variables: {courseUniqueName: course.uniqueName, infoPageId: infopage.id, contentBlockId: 'abc1234', content: newContent}});
    expect(contentBlockEditQuery.data.modifyContentBlock).toEqual(null);
    expect(contentBlockEditQuery.errors[0].message).toEqual('Given content block not found');

    await checkContentBlockContent(contentBlock.content);
  });
});
