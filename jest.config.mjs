export default {
  testMatch:['**/tests/server.test.mjs'],
  transform:{},
  coverageProvider:'v8',
  collectCoverageFrom:['server/app.mjs','server/database.mjs'],
  coverageThreshold:{global:{lines:85,statements:85,functions:85,branches:80}},
  testTimeout:20000
};
