import type { CollectionKind, ContentItem } from "@/types/content";

// Explicit development fixtures. Replace through the content service when CMS APIs exist.
export const demoContent: Record<CollectionKind, ContentItem[]> = {
  projects: [
    {
      slug: "demo-new-beginnings",
      title: "New Beginnings",
      category: "Short Film",
      status: "Running",
      description:
        "A small town. An unexpected encounter. A chance to start again.",
      body: [
        "This is a sample project for previewing the platform, not an announced M. Dadu Films production.",
        "Project synopsis, credits, production updates and a trailer will appear here when supplied.",
      ],
    },
    {
      slug: "demo-city-stories",
      title: "City Stories",
      category: "Web Series",
      status: "Upcoming",
      description:
        "Interconnected lives, told through the rhythm of a changing city.",
      body: [
        "This sample series demonstrates an upcoming project.",
        "The final production details and creative team are awaiting confirmation.",
      ],
    },
    {
      slug: "demo-between-frames",
      title: "Between Frames",
      category: "Documentary",
      status: "Completed",
      description: "A look at the people whose work happens behind the camera.",
      body: [
        "This is a demonstration of a completed project page.",
        "Approved project images and credits will replace these placeholders.",
      ],
    },
  ],
  casting: [
    {
      slug: "demo-lead-performer",
      title: "Lead performer",
      category: "Acting",
      status: "Open",
      location: "Location to be confirmed",
      role: "Lead role",
      description: "An expressive performer for a character-led short film.",
      body: [
        "Sample casting notice only; applications are not open for a real production.",
        "Age range, shoot dates, compensation, experience requirements and deadline are awaiting approval.",
      ],
    },
    {
      slug: "demo-assistant-director",
      title: "Assistant director",
      category: "Crew",
      status: "Open",
      location: "Location to be confirmed",
      role: "Production crew",
      description:
        "Bring your organisation and storytelling skills to a collaborative set.",
      body: [
        "Sample crew notice only.",
        "Final requirements, dates and compensation will be published with the confirmed opportunity.",
      ],
    },
  ],
  blog: [
    {
      slug: "demo-audition-preparation",
      title: "Preparing for your next audition",
      category: "Acting",
      description:
        "Make room for preparation, curiosity and your own interpretation.",
      body: [
        "Read the brief carefully and understand what is being requested. Prepare your material and check the format before the audition.",
        "Give yourself time to warm up and arrive prepared. Listen, take direction and stay open to trying a scene differently.",
        "This editorial sample is provided for the development preview and awaits company review.",
      ],
    },
    {
      slug: "demo-creative-collaboration",
      title: "The people behind a great story",
      category: "Filmmaking",
      description:
        "A film grows through many perspectives and a shared purpose.",
      body: [
        "Every production brings together different disciplines. Good communication lets those perspectives strengthen the story.",
        "This article is sample content for previewing the blog. Approved editorial content will be managed through the CMS.",
      ],
    },
  ],
  team: [],
  gallery: [
    {
      slug: "demo-on-set",
      title: "On set",
      category: "On Set",
      description: "A space for moments from our productions.",
      body: [],
    },
    {
      slug: "demo-bts",
      title: "Between takes",
      category: "Behind the Scenes",
      description: "The work behind the finished frame.",
      body: [],
    },
    {
      slug: "demo-projects",
      title: "In the making",
      category: "Projects",
      description: "Stories taking shape.",
      body: [],
    },
  ],
  "behind-the-scenes": [
    {
      slug: "demo-set-diary",
      title: "A day on set",
      category: "Production Diary",
      description: "A closer look at the process behind the stories.",
      body: [],
    },
  ],
  shows: [],
};

export const collectionCopy: Record<
  CollectionKind,
  { eyebrow: string; title: string; description: string }
> = {
  projects: {
    eyebrow: "Our work",
    title: "Stories in the making.",
    description: "Explore running, upcoming and completed projects.",
  },
  casting: {
    eyebrow: "Opportunities",
    title: "Your next chapter starts here.",
    description:
      "Find acting and crew opportunities, and the people to create with.",
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
