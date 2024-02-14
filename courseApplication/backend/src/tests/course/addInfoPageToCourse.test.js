

const {Course} = require('../../models/course');
const {addInfoPageToCourse} = require('../courseTestQueries');
const helpers = require('../testHelpers');


describe('addInfoPageToCourse tests', () => {
  test('createInfoPageToCourse creates a new info page correctly', async () => {
    await helpers.logIn('username');
    const course = await helpers.createCourse('course-unique-name', 'name of course', []);
    const allowedLocationUrl = 'test123-1234abc-a1b2c';
    const infoPageQuery = await helpers.makeQuery({query: addInfoPageToCourse, variables: {courseUniqueName: course.uniqueName, locationUrl: allowedLocationUrl}});

    expect(infoPageQuery.data.addInfoPageToCourse.locationUrl).toBeDefined();

    const coursesInDB = await Course.find();
    expect(coursesInDB.length).toBe(1);
    const courseInDB = coursesInDB[0];

    expect(courseInDB.infoPages.length).toBe(1);
    const infoPageInDB = courseInDB.infoPages[0];

    expect(infoPageInDB.contentBlocks).toEqual([]);
    expect(infoPageInDB.locationUrl).toEqual(allowedLocationUrl);
  });
  test('createInfoPageToCourse returns Unauthorized if the user is not a teacher', async () => {
    await helpers.logIn('username');
    const course = await helpers.createCourse('course-unique-name', 'name of course', []);

    await helpers.logIn('students username');
    const infoPageQuery = await helpers.makeQuery({query: addInfoPageToCourse, variables: {courseUniqueName: course.uniqueName, locationUrl: 'test'}});
    expect(infoPageQuery.errors[0].message).toEqual('Unauthorized');
    expect(infoPageQuery.data.addInfoPageToCourse).toBe(null);

    const coursesInDB = await Course.find();
    expect(coursesInDB.length).toBe(1);
    const courseInDB = coursesInDB[0];
    expect(courseInDB.infoPages.length).toBe(0);
  });
  test('createInfoPageToCourse does not allow multiple pages with the same url', async () => {
    await helpers.logIn('username');
    const course = await helpers.createCourse('course-unique-name', 'name of course', []);
    const allowedLocationUrl = 'test123-1234abc-a1b2c';
    await helpers.makeQuery({query: addInfoPageToCourse, variables: {courseUniqueName: course.uniqueName, locationUrl: allowedLocationUrl}});
    const secondInfoPageQuery = await helpers.makeQuery({query: addInfoPageToCourse, variables: {courseUniqueName: course.uniqueName, locationUrl: allowedLocationUrl}});

    expect(secondInfoPageQuery.data.addInfoPageToCourse).toBe(null);
    expect(secondInfoPageQuery.errors[0].message).toEqual('Given page already exists');

    const coursesInDB = await Course.find();
    expect(coursesInDB.length).toBe(1);
    const courseInDB = coursesInDB[0];
    expect(courseInDB.infoPages.length).toBe(1);
  });
  describe('createInfoPageToCourse returns Incorrect locationUrl if the location url is incorrect', () => {
    test('with spaces ', async () => {
      await helpers.logIn('username');
      const course = await helpers.createCourse('course-unique-name', 'name of course', []);

      const infoPageQuery = await helpers.makeQuery({query: addInfoPageToCourse, variables: {courseUniqueName: course.uniqueName, locationUrl: 'this is incorrect url'}});
      expect(infoPageQuery.errors[0].message).toContain('Incorrect locationUrl');
      expect(infoPageQuery.data.addInfoPageToCourse).toBe(null);

      const coursesInDB = await Course.find();
      expect(coursesInDB.length).toBe(1);
      const courseInDB = coursesInDB[0];

      expect(courseInDB.infoPages.length).toBe(0);
    });
    test('with / ', async () => {
      await helpers.logIn('username');
      const course = await helpers.createCourse('course-unique-name', 'name of course', []);

      const infoPageQuery = await helpers.makeQuery({query: addInfoPageToCourse, variables: {courseUniqueName: course.uniqueName, locationUrl: 'this/is/incorrect/url'}});
      expect(infoPageQuery.errors[0].message).toContain('Incorrect locationUrl');
      expect(infoPageQuery.data.addInfoPageToCourse).toBe(null);

      const coursesInDB = await Course.find();
      expect(coursesInDB.length).toBe(1);
      const courseInDB = coursesInDB[0];

      expect(courseInDB.infoPages.length).toBe(0);
    });
    test('with % ', async () => {
      await helpers.logIn('username');
      const course = await helpers.createCourse('course-unique-name', 'name of course', []);

      const infoPageQuery = await helpers.makeQuery({query: addInfoPageToCourse, variables: {courseUniqueName: course.uniqueName, locationUrl: 'this%is%incorrect%url'}});
      expect(infoPageQuery.errors[0].message).toContain('Incorrect locationUrl');
      expect(infoPageQuery.data.addInfoPageToCourse).toBe(null);

      const coursesInDB = await Course.find();
      expect(coursesInDB.length).toBe(1);
      const courseInDB = coursesInDB[0];

      expect(courseInDB.infoPages.length).toBe(0);
    });
    test('starting with - ', async () => {
      await helpers.logIn('username');
      const course = await helpers.createCourse('course-unique-name', 'name of course', []);

      const infoPageQuery = await helpers.makeQuery({query: addInfoPageToCourse, variables: {courseUniqueName: course.uniqueName, locationUrl: '-this-is-incorrect-url'}});
      expect(infoPageQuery.errors[0].message).toContain('Incorrect locationUrl');
      expect(infoPageQuery.data.addInfoPageToCourse).toBe(null);

      const coursesInDB = await Course.find();
      expect(coursesInDB.length).toBe(1);
      const courseInDB = coursesInDB[0];

      expect(courseInDB.infoPages.length).toBe(0);
    });
    test('ending with -', async () => {
      await helpers.logIn('username');
      const course = await helpers.createCourse('course-unique-name', 'name of course', []);

      const infoPageQuery = await helpers.makeQuery({query: addInfoPageToCourse, variables: {courseUniqueName: course.uniqueName, locationUrl: 'this-is-incorrect-url-'}});
      expect(infoPageQuery.errors[0].message).toContain('Incorrect locationUrl');
      expect(infoPageQuery.data.addInfoPageToCourse).toBe(null);

      const coursesInDB = await Course.find();
      expect(coursesInDB.length).toBe(1);
      const courseInDB = coursesInDB[0];

      expect(courseInDB.infoPages.length).toBe(0);
    });
    test('starting and ending with -', async () => {
      await helpers.logIn('username');
      const course = await helpers.createCourse('course-unique-name', 'name of course', []);

      const infoPageQuery = await helpers.makeQuery({query: addInfoPageToCourse, variables: {courseUniqueName: course.uniqueName, locationUrl: '-this-is-incorrect-url-'}});
      expect(infoPageQuery.errors[0].message).toContain('Incorrect locationUrl');
      expect(infoPageQuery.data.addInfoPageToCourse).toBe(null);

      const coursesInDB = await Course.find();
      expect(coursesInDB.length).toBe(1);
      const courseInDB = coursesInDB[0];

      expect(courseInDB.infoPages.length).toBe(0);
    });
    test('with double -', async () => {
      await helpers.logIn('username');
      const course = await helpers.createCourse('course-unique-name', 'name of course', []);

      const infoPageQuery = await helpers.makeQuery({query: addInfoPageToCourse, variables: {courseUniqueName: course.uniqueName, locationUrl: 'this--is-incorrect-url'}});
      expect(infoPageQuery.errors[0].message).toContain('Incorrect locationUrl');
      expect(infoPageQuery.data.addInfoPageToCourse).toBe(null);

      const coursesInDB = await Course.find();
      expect(coursesInDB.length).toBe(1);
      const courseInDB = coursesInDB[0];

      expect(courseInDB.infoPages.length).toBe(0);
    });
  });
});
