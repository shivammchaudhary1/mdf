import type { CollectionKind } from "@/types/content";

export const collectionCopy: Record<CollectionKind, { eyebrow: string; title: string; description: string }> = {
  projects: {
    eyebrow: "Our work",
    title: "Stories in the making.",
    description: "Explore running, upcoming and completed projects.",
  },
  casting: {
    eyebrow: "Opportunities",
    title: "Your next chapter starts here.",
    description: "Find acting and crew opportunities, and the people to create with.",
  },
  blog: {
    eyebrow: "Journal",
    title: "Notes from the creative world.",
    description: "Ideas, perspectives and stories from behind the frame.",
  },
  team: {
    eyebrow: "Our people",
    title: "The people behind the stories.",
    description: "Meet the creative minds who bring our work to life.",
  },
  gallery: {
    eyebrow: "Our gallery",
    title: "Moments from our journey.",
    description: "A glimpse into the work, the people and the process.",
  },
  "behind-the-scenes": {
    eyebrow: "Behind the scenes",
    title: "Before the final frame.",
    description: "Discover the collaboration and craft that happens on set.",
  },
  shows: {
    eyebrow: "Shows & media",
    title: "Watch. Discover. Connect.",
    description: "Conversations, trailers and stories from M. Dadu Films.",
  },
};
