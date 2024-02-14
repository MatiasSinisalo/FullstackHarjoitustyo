

const {Course} = require('../../models/course');
const {addInfoPageToCourse, removeInfoPageFromCourse} = require('../courseTestQueries');
const helpers = require('../testHelpers');


const checkInfoPageStillExists = async (infoPage) => {
  const coursesInDB = await Course.find({});
  expect(coursesInDB.length).toBe(1);
  const courseInDB = coursesInDB[0];
  expect(courseInDB.infoPages.length).toBe(1);
  expect(courseInDB.infoPages[0].id).toEqual(infoPage.id);
};

describe('removeInfoPageFromCourse tests', () => {
  test('remove info page removes info page correctly', async () => {
    await helpers.logIn('username');


    const course = await helpers.createCourse('courses-unique-name', 'name', []);
    const infoPageThatShouldNotBeRemoved = await helpers.makeQuery({
      query: addInfoPageToCourse, variables: {courseUniqueName: course.uniqueName, locationUrl: 'this-is-not-to-be-removed'}});

    const infoPageQuery = await helpers.makeQuery({query: addInfoPageToCourse, variables: {courseUniqueName: course.uniqueName, locationUrl: 'this-is-url'}});
    const infoPage = infoPageQuery.data.addInfoPageToCourse;
    const infoPageRemoveQuery = await helpers.makeQuery({query: removeInfoPageFromCourse, variables: {courseUniqueName: course.uniqueName, infoPageId: infoPage.id}});

    expect(infoPageRemoveQuery.data.removeInfoPageFromCourse).toBe(true);

    await checkInfoPageStillExists(infoPageThatShouldNotBeRemoved.data.addInfoPageToCourse);
  });

  test('remove info page returns Unauthorized if the user is not a teacher', async () => {
    await helpers.logIn('username');
    const course = await helpers.createCourse('courses-unique-name', 'name', []);
    const infoPageQuery = await helpers.makeQuery({query: addInfoPageToCourse, variables: {courseUniqueName: course.uniqueName, locationUrl: 'this-is-url'}});
    const infoPage = infoPageQuery.data.addInfoPageToCourse;
    await helpers.logIn('students username');
    const infoPageRemoveQuery = await helpers.makeQuery({query: removeInfoPageFromCourse, variables: {courseUniqueName: course.uniqueName, infoPageId: infoPage.id}});

    expect(infoPageRemoveQuery.errors[0].message).toBe('Unauthorized');
    expect(infoPageRemoveQuery.data.removeInfoPageFromCourse).toBe(null);

    await checkInfoPageStillExists(infoPage);
  });

  test('removeInfoPageFromCourse returns given course not found if the course is not found', async () => {
    await helpers.logIn('username');
    const course = await helpers.createCourse('courses-unique-name', 'name', []);
    const infoPageQuery = await helpers.makeQuery({query: addInfoPageToCourse, variables: {courseUniqueName: course.uniqueName, locationUrl: 'this-is-url'}});
    const infoPage = infoPageQuery.data.addInfoPageToCourse;
    const infoPageRemoveQuery = await helpers.makeQuery({query: removeInfoPageFromCourse, variables: {courseUniqueName: 'course does not exist', infoPageId: infoPage.id}});

    expect(infoPageRemoveQuery.errors[0].message).toBe('Given course not found');
    expect(infoPageRemoveQuery.data.removeInfoPageFromCourse).toBe(null);

    await checkInfoPageStillExists(infoPage);
  });

  test('removeInfoPageFromCourse returns given page not found if the page is not found', async () => {
    await helpers.logIn('username');
    const course = await helpers.createCourse('courses-unique-name', 'name', []);
    const infoPageQuery = await helpers.makeQuery({query: addInfoPageToCourse, variables: {courseUniqueName: course.uniqueName, locationUrl: 'this-is-url'}});
    const infoPage = infoPageQuery.data.addInfoPageToCourse;
    const infoPageRemoveQuery = await helpers.makeQuery({query: removeInfoPageFromCourse, variables: {courseUniqueName: course.uniqueName, infoPageId: 'abc1234'}});

    expect(infoPageRemoveQuery.errors[0].message).toBe('Given info page not found');
    expect(infoPageRemoveQuery.data.removeInfoPageFromCourse).toBe(null);

    await checkInfoPageStillExists(infoPage);
  });
});

