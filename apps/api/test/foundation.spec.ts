import { validateEnvironment } from "../src/config/environment";
import { profileCompletion } from "../src/modules/profiles/profile.service";

describe("backend v2 foundation", () => {
  const env = {
    MONGODB_URI: "mongodb://localhost:27017/test",
    COOKIE_SECRET: "a_long_random_cookie_secret_for_testing_123456789",
  };

  it("provides safe local defaults", () => {
    expect(validateEnvironment(env)).toMatchObject({
      PORT: 8888,
      FRONTEND_URL: "http://localhost:3333",
      STORAGE_DRIVER: "local",
      SESSION_SHORT_HOURS: 12,
      SESSION_REMEMBER_DAYS: 30,
      MONGODB_MAX_POOL_SIZE: 20,
    });
  });

  it("rejects weak cookie secrets and invalid frontend origins", () => {
    expect(() => validateEnvironment({ ...env, COOKIE_SECRET: "short" })).toThrow("COOKIE_SECRET");
    expect(() => validateEnvironment({ ...env, FRONTEND_URL: "https://example.com/path" })).toThrow("FRONTEND_URL");
  });

  it("requires S3 config only when S3 is enabled", () => {
    expect(() => validateEnvironment({ ...env, STORAGE_DRIVER: "s3" })).toThrow("AWS_REGION");
  });

  it("calculates profile completion from ten bounded signals", () => {
    expect(profileCompletion({ bio: "Bio", city: "Indore", profession: "Actor", skills: ["Acting"], languages: ["Hindi"] })).toBe(50);
  });
});
