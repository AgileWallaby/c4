module.exports = {
  displayName: "c4-model-examples",
  preset: "../../jest.preset.js",
  testEnvironment: "node",
  transform: {
    "^.+\\.[tj]s$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.spec.json" }],
  },
  moduleFileExtensions: ["ts", "js", "html"],
  transformIgnorePatterns: ["/node_modules/.pnpm/(?!(change-case))"],
  coverageDirectory: "../../coverage/libs/c4-model-examples",
};
