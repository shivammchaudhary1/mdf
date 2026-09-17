module.exports = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/test/**/*.spec.ts"],
  extensionsToTreatAsEsm: [".ts"],
  transform: { "^.+\\.ts$": ["ts-jest", { useESM: true, tsconfig: { module: "ESNext", moduleResolution: "node", experimentalDecorators: true, emitDecoratorMetadata: true } }] },
  clearMocks: true,
};
