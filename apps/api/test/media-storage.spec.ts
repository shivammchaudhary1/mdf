import { mediaPurposes } from "../src/modules/media/media.model";
import { validateStorageKey } from "../src/modules/media/storage";

describe("production media storage keys", () => {
  const id = "0123456789abcdef01234567";
  const userId = "abcdef0123456789abcdef01";

  it("accepts the approved asset hierarchy", () => {
    for (const folder of ["website-images", "projects", "castings", "blog", "gallery", "team", "bts", "shows"]) {
      expect(validateStorageKey(`assets/${folder}/${id}/thumb.webp`)).toBe(`assets/${folder}/${id}/thumb.webp`);
      expect(validateStorageKey(`assets/${folder}/${id}/large.webp`)).toBe(`assets/${folder}/${id}/large.webp`);
    }
  });

  it("accepts user profile, portfolio and resume hierarchy", () => {
    expect(validateStorageKey(`users/${userId}/profile-pic/${id}/profile.webp`)).toBe(`users/${userId}/profile-pic/${id}/profile.webp`);
    expect(validateStorageKey(`users/${userId}/portfolio-images/${id}/medium.webp`)).toBe(
      `users/${userId}/portfolio-images/${id}/medium.webp`,
    );
    expect(validateStorageKey(`users/${userId}/resume/${id}/document.pdf`)).toBe(`users/${userId}/resume/${id}/document.pdf`);
  });

  it("keeps legacy keys readable during migration", () => {
    expect(validateStorageKey(`media/${id}/medium.webp`)).toBe(`media/${id}/medium.webp`);
    expect(validateStorageKey(`media/${id}/document.pdf`)).toBe(`media/${id}/document.pdf`);
  });

  it("rejects arbitrary paths and extensions", () => {
    expect(() => validateStorageKey("../secret")).toThrow("Invalid storage key.");
    expect(() => validateStorageKey(`assets/projects/${id}/original.png`)).toThrow("Invalid storage key.");
    expect(() => validateStorageKey(`users/${userId}/resume/${id}/resume.exe`)).toThrow("Invalid storage key.");
  });

  it("defines every controlled upload purpose", () => {
    expect(mediaPurposes).toEqual([
      "website-image",
      "project",
      "casting",
      "blog",
      "gallery",
      "team",
      "bts",
      "show",
      "user-profile",
      "user-portfolio",
      "user-resume",
    ]);
  });
});
