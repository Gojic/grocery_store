/** @type {import('jest').Config} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,
    modulePathIgnorePatterns: ["<rootDir>/dist/"],
    setupFiles: ["<rootDir>/src/tests/setup-env.ts"],
    setupFilesAfterEnv: ["<rootDir>/src/tests/setup-after-env.ts"],
    roots: ["<rootDir>/src"],
    testMatch: [
        "**/*.test.ts",
        "**/*.spec.ts",
        "**/*Test.ts"
    ],
};
