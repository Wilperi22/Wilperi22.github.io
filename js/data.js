/* ==========================================================================
   PORTFOLIO CONTENT — this is the only file you need to edit.
   Everything on the desktop (apps, files, terminal output) is generated
   from this object. Content below comes from Wili_Asp_CV_EN.pdf.

   Tips
   - Colors must be 6-digit hex (e.g. "#7c9cff").
   - Skills: plain strings render as tags. Use { name: "Python", level: 80 }
     instead if you want a percentage bar.
   - Screenshots: add  src: "assets/my-shot.png"  to use a real image.
     Without src, a placeholder mock-up is generated.
   - Videos: add  src: "assets/my-demo.mp4"  to play a real file.
     Without src, an animated placeholder plays instead.
   - Avatar: set profile.avatar to an image path, or leave "" for initials.
   ========================================================================== */
window.PORTFOLIO = {
  osName: "Portfolio OS",

  profile: {
    name: "Wili Asp",
    handle: "wilperi22",
    role: "ICT Engineering Student · Data Engineering, Analytics & AI",
    location: "Turku, Finland (open to Tampere)",
    email: "aspwili1@gmail.com",
    avatar: "",
    available: true,
    availabilityText: "Open to opportunities in Turku and Tampere",
    tagline: "Second-year ICT engineering student interested in generative AI, data and automation.",
    bio: [
      "I'm a second-year Information and Communication Technology engineering student at Turku University of Applied Sciences, on the Data Engineering, Analytics and AI track, graduating in spring 2028.",
      "I'm interested in generative AI, data and automation: I have built an ETL pipeline and an LLM-based simulation, and used Power BI and Power Automate.",
      "Before my studies I worked as a CNC machinist, where measurement, quality control and deviation reporting were part of daily work — so I work carefully and systematically."
    ]
  },

  skills: [
    { group: "Data and databases", items: ["SQL (PostgreSQL, SQLite)", "NoSQL (database course)", "Python (pandas)", "API integrations"] },
    { group: "Visualisation and reporting", items: ["Power BI", "Data visualisation with Python", "Excel"] },
    { group: "AI and automation", items: ["Generative AI", "LLMs (local models)", "Workflow automation (Power Automate)"] },
    { group: "Tools", items: ["Git and GitHub", "Docker", "Linux"] },
    { group: "Programming", items: ["Python"] }
  ],

  experience: [
    { role: "CNC Machinist", company: "AGCO Power", period: "2/2023 — 8/2025",
      summary: "Worked in an automated production environment (ABB, Fanuc). Measurement, quality control and deviation reporting as part of daily work. Systematic investigation and resolution of production problems; following precise work instructions." },
    { role: "Production work", company: "Porkka", period: "2019 — 2021",
      summary: "Internships in 2019 and 2021, followed by employment after the internship." },
    { role: "Military service", company: "Säkylä", period: "1/2022",
      summary: "Non-commissioned officer course." }
  ],

  education: [
    { title: "B.Eng., Information and Communication Technology", place: "Turku University of Applied Sciences — specialisation: Data Engineering, Analytics and AI", period: "2025 — 2028 (expected)" },
    { title: "Vocational qualification in Mechanical and Production Engineering", place: "Tredu", period: "2018 — 2021" }
  ],

  languages: [
    { name: "Finnish", level: "native" },
    { name: "English", level: "excellent" }
  ],

  projects: [
    {
      id: "shift-pay-calculator",
      name: "Shift Pay Calculator",
      badge: "Personal project",
      tagline: "Fetches work shifts from Google Calendar and calculates hours, supplements and pay.",
      description: "A personal project that fetches work shifts from the Google Calendar API and calculates working hours, supplements and pay. It is built as an ETL pipeline (Extract, Transform, Load) in Python, with results stored in a PostgreSQL database running in Docker.",
      tech: ["Python", "Google Calendar API", "ETL", "PostgreSQL", "Docker"],
      color: ["#7c9cff", "#b47cff"],
      highlights: [
        "Fetches work shifts from the Google Calendar API",
        "Calculates working hours, supplements and pay",
        "ETL structure in Python, stored in PostgreSQL running in Docker"
      ],
      links: { source: "https://github.com/Wilperi22/Calendar" },
      screenshots: [{ title: "Overview" }, { title: "Data" }],
      video: { title: "Shift Pay Calculator — Demo", duration: 24 }
    },
    {
      id: "traficom-hackathon",
      name: "Traficom Hackathon",
      badge: "Since AI 2026 · Team project",
      tagline: "Automated analysis of the ITU's biweekly IFIC publications for interference cases affecting Finland.",
      description: "A team project from the Since AI 2026 hackathon. It automates the analysis of the ITU's biweekly IFIC publications: it identifies satellite and foreign-station interference cases affecting Finland and produces a reasoned report. I was responsible for designing and directing the ETL pipeline and data handling, implemented AI-assisted with Claude Code.",
      tech: ["ETL", "SQLite", "MDB conversion", "Claude Code", "Excel / CSV / JSON"],
      color: ["#34d399", "#22d3ee"],
      highlights: [
        "Identifies satellite and foreign-station interference cases affecting Finland",
        "Fetches data from the ITU and converts MDB files to SQLite",
        "Stores results in a database and in Excel, CSV and JSON",
        "Produces a reasoned report"
      ],
      links: { source: "https://github.com/Wilperi22/SinceAI-Traficom" },
      screenshots: [{ title: "Overview" }, { title: "Data" }],
      video: { title: "Traficom Hackathon — Demo", duration: 28 }
    },
    {
      id: "crypto-hackathon",
      name: "Crypto Hackathon",
      badge: "3rd place · 24 h team project",
      tagline: "LLM-based crypto trading simulation comparing the decisions of local language models.",
      description: "A 24-hour team hackathon project that placed 3rd. We built an LLM-based crypto trading simulation in which local language models were used programmatically and their buy and sell decisions were compared. I was responsible for data handling, data quality and visualisation.",
      tech: ["Local LLMs", "Data handling", "Data visualisation"],
      color: ["#fbbf24", "#f97316"],
      highlights: [
        "Local language models used programmatically",
        "Buy and sell decisions compared between models",
        "Price, decisions and portfolio value shown as charts"
      ],
      links: {},
      screenshots: [{ title: "Overview" }, { title: "Data" }]
    },
    {
      id: "hotel-booking-system",
      name: "Hotel Booking System",
      badge: "Course final project",
      tagline: "Room and booking management with double-booking prevention.",
      description: "The final project of a programming course: a hotel booking system built with Python and SQLite. It covers room and booking management, double-booking prevention, price calculation and input validation.",
      tech: ["Python", "SQLite"],
      color: ["#f472b6", "#fb7185"],
      highlights: [
        "Room and booking management",
        "Double-booking prevention",
        "Price calculation and input validation"
      ],
      links: {},
      screenshots: [{ title: "Overview" }, { title: "Data" }]
    }
  ],

  showreel: {
    title: "Project overview",
    color: ["#7c9cff", "#f472b6"],
    duration: 32,
    scenes: ["Shift Pay Calculator", "Traficom Hackathon — Since AI 2026", "Crypto Hackathon — 3rd place", "Hotel Booking System"]
    // src: "assets/showreel.mp4"
  },

  socials: [
    { id: "github", name: "GitHub", handle: "@Wilperi22", url: "https://github.com/Wilperi22",
      color: "#8b949e", description: "Source code for my projects." }
  ]
};
