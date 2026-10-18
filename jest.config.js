/** Configuration Jest — dossier Tests/ */
// Babel est configuré ici et non dans babel.config.js : Next.js (Turbopack)
// refuse de builder dès qu'un fichier de config Babel est présent.
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/Tests/**/*.test.js"],
  transform: {
    "^.+\\.js$": [
      "babel-jest",
      {
        configFile: false,
        babelrc: false,
        presets: [["@babel/preset-env", { targets: { node: "current" } }]],
      },
    ],
  },
  verbose: true,
};
