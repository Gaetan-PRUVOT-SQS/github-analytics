/** Configuration Jest — dossier Tests/ */
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/Tests/**/*.test.js"],
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  verbose: true,
};
