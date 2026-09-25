import { mediaPurposes } from "../src/modules/media/media.model";
import { validateStorageKey } from "../src/modules/media/storage";

describe("production media storage keys", () => {
  const id = "0123456789abcdef01234567";
  const memberId = "abcdef0123456789abcdef01";

  it("accepts the approved website asset hierarchy", () => {
    for (const folder of ["website-images", "services", "projects", "castings", "blog", "gallery", "team", "shows"]) {
      expect(validateStorageKey(`assets/${folder}/${id}/thumb.webp`)).toBe(`assets/${folder}/${id}/thumb.webp`);
      expect(validateStorageKey(`assets/${folder}/${id}/large.webp`)).toBe(`assets/${folder}/${id}/large.webp`);
    }
  });

  it("uses one gallery hierarchy for new Gallery and BTS storage", () => {
    expect(validateStorageKey(`assets/gallery/${id}/thumb.webp`)).toBe(`assets/gallery/${id}/thumb.webp`);
    expect(validateStorageKey(`assets/gallery/${id}/large.webp`)).toBe(`assets/gallery/${id}/large.webp`);
  });

  it("accepts the final member profile, portfolio and resume hierarchy", () => {
    expect(validateStorageKey(`members/${memberId}/profile/${id}/profile.webp`)).toBe(
      `members/${memberId}/profile/${id}/profile.webp`,
    );
    expect(validateStorageKey(`members/${memberId}/portfolio/${id}/medium.webp`)).toBe(
      `members/${memberId}/portfolio/${id}/medium.webp`,
    );
    expect(validateStorageKey(`members/${memberId}/resume/${id}/document.pdf`)).toBe(
      `members/${memberId}/resume/${id}/document.pdf`,
    );
  });

  it("keeps old development/storage keys readable during migration", () => {
    expect(validateStorageKey(`media/${id}/medium.webp`)).toBe(`media/${id}/medium.webp`);
    expect(validateStorageKey(`media/${id}/document.pdf`)).toBe(`media/${id}/document.pdf`);
    expect(validateStorageKey(`assets/bts/${id}/large.webp`)).toBe(`assets/bts/${id}/large.webp`);
    expect(validateStorageKey(`members/${memberId}/profile-pic/${id}/profile.webp`)).toBe(
      `members/${memberId}/profile-pic/${id}/profile.webp`,
    );
    expect(validateStorageKey(`members/${memberId}/portfolio-images/${id}/medium.webp`)).toBe(
      `members/${memberId}/portfolio-images/${id}/medium.webp`,
    );
  });

  it("rejects arbitrary paths and unsupported new asset folders", () => {
    expect(() => validateStorageKey("../secret")).toThrow("Invalid storage key.");
    expect(() => validateStorageKey(`assets/random/${id}/large.webp`)).toThrow("Invalid storage key.");
    expect(() => validateStorageKey(`assets/projects/${id}/original.png`)).toThrow("Invalid storage key.");
    expect(() => validateStorageKey(`members/${memberId}/resume/${id}/resume.exe`)).toThrow("Invalid storage key.");
  });

  it("defines every controlled upload purpose", () => {
    expect(mediaPurposes).toEqual([
      "website-image",
      "service",
      "project",
      "casting",
      "blog",
      "gallery",
      "team",
      "bts",
      "show",
      "member-profile",
      "member-portfolio",
      "member-resume",
    ]);
  });
});
