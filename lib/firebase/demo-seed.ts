export const DEMO_USER_ID = "demo-user-1";
export const DEMO_PARTNER_ID = "demo-user-2";
export const DEMO_COUPLE_ID = "demo-couple-1";

const today = Date.now();
const day = 24 * 60 * 60 * 1000;

function svgPhoto(label: string, from: string, to: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${from}"/><stop offset="100%" stop-color="${to}"/></linearGradient></defs><rect width="800" height="600" fill="url(#g)"/><circle cx="400" cy="250" r="120" fill="rgba(255,255,255,0.18)"/><circle cx="370" cy="220" r="14" fill="rgba(255,255,255,0.9)"/><circle cx="430" cy="220" r="14" fill="rgba(255,255,255,0.9)"/><path d="M 360 260 Q 400 300 440 260" stroke="rgba(255,255,255,0.9)" stroke-width="8" fill="none" stroke-linecap="round"/><text x="400" y="440" font-family="system-ui" font-size="44" font-weight="700" fill="rgba(255,255,255,0.95)" text-anchor="middle">${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const seed = {
  "users": {
    [DEMO_USER_ID]: {
      email: "alex@ustogether.demo",
      displayName: "Alex",
      points: 342,
      streak: 12,
      lastActiveDate: new Date(today).toISOString().slice(0, 10),
      pairedCoupleId: DEMO_COUPLE_ID,
      createdAt: today - 180 * day,
      updatedAt: today - day,
    },
    [DEMO_PARTNER_ID]: {
      email: "sam@ustogether.demo",
      displayName: "Sam",
      points: 318,
      streak: 12,
      lastActiveDate: new Date(today).toISOString().slice(0, 10),
      pairedCoupleId: DEMO_COUPLE_ID,
      createdAt: today - 180 * day,
      updatedAt: today - day,
    },
  },
  "couples": {
    [DEMO_COUPLE_ID]: {
      user1Id: DEMO_USER_ID,
      user2Id: DEMO_PARTNER_ID,
      coupleName: "Alex + Sam",
      status: "active",
      totalScore: 660,
      createdAt: today - 180 * day,
      updatedAt: today - day,
    },
  },
  "couples/demo-couple-1/sessions": {
    "s1": {
      coupleId: DEMO_COUPLE_ID,
      type: "quiz",
      status: "finished",
      quizTitle: "How Well Do You Know Me?",
      quizId: "q1",
      state: {
        answers: {
          0: { [DEMO_USER_ID]: "Sunset walks on the beach", [DEMO_PARTNER_ID]: "Late-night cooking together" },
          1: { [DEMO_USER_ID]: "Coffee, black", [DEMO_PARTNER_ID]: "Chai latte" },
          2: { [DEMO_USER_ID]: "Tuscany", [DEMO_PARTNER_ID]: "Japan" },
          3: { [DEMO_USER_ID]: "Saturday morning", [DEMO_PARTNER_ID]: "Sunday evening" },
        },
        currentQuestion: 4,
        scores: { [DEMO_USER_ID]: 85, [DEMO_PARTNER_ID]: 70 },
      },
      createdAt: today - 3 * day,
      updatedAt: today - 3 * day,
    },
    "s2": {
      coupleId: DEMO_COUPLE_ID,
      type: "quiz",
      status: "finished",
      quizTitle: "Date Night Preferences",
      quizId: "q2",
      state: {
        answers: {
          0: { [DEMO_USER_ID]: "Cozy dinner at home", [DEMO_PARTNER_ID]: "Cozy dinner at home" },
          1: { [DEMO_USER_ID]: "Indie films", [DEMO_PARTNER_ID]: "Documentaries" },
          2: { [DEMO_USER_ID]: "Sushi", [DEMO_PARTNER_ID]: "Sushi" },
        },
        currentQuestion: 3,
        scores: { [DEMO_USER_ID]: 80, [DEMO_PARTNER_ID]: 95 },
      },
      createdAt: today - 9 * day,
      updatedAt: today - 9 * day,
    },
    "s3": {
      coupleId: DEMO_COUPLE_ID,
      type: "quiz",
      status: "finished",
      quizTitle: "Love Languages",
      quizId: "q3",
      state: {
        answers: {
          0: { [DEMO_USER_ID]: "Quality time", [DEMO_PARTNER_ID]: "Quality time" },
          1: { [DEMO_USER_ID]: "Words of affirmation", [DEMO_PARTNER_ID]: "Physical touch" },
          2: { [DEMO_USER_ID]: "Acts of service", [DEMO_PARTNER_ID]: "Acts of service" },
        },
        currentQuestion: 3,
        scores: { [DEMO_USER_ID]: 90, [DEMO_PARTNER_ID]: 88 },
      },
      createdAt: today - 15 * day,
      updatedAt: today - 15 * day,
    },
    "s4": {
      coupleId: DEMO_COUPLE_ID,
      type: "quiz",
      status: "waiting",
      quizTitle: null,
      state: { waitingFor: DEMO_USER_ID },
      createdAt: today - day,
      updatedAt: today - day,
    },
  },
  "couples/demo-couple-1/memory_photos": {
    "p1": {
      coupleId: DEMO_COUPLE_ID,
      url: svgPhoto("First Sunrise", "#f97316", "#ec4899"),
      caption: "Sunrise at Coney Island",
      createdAt: today - 40 * day,
      uploadedAt: today - 40 * day,
    },
    "p2": {
      coupleId: DEMO_COUPLE_ID,
      url: svgPhoto("Our Kitchen", "#6366f1", "#8b5cf6"),
      caption: "First dinner we cooked together",
      createdAt: today - 22 * day,
      uploadedAt: today - 22 * day,
    },
    "p3": {
      coupleId: DEMO_COUPLE_ID,
      url: svgPhoto("Weekend Hike", "#10b981", "#06b6d4"),
      caption: "Hudson Highlands trail",
      createdAt: today - 5 * day,
      uploadedAt: today - 5 * day,
    },
  },
  "couples/demo-couple-1/milestones": {
    "m1": {
      coupleId: DEMO_COUPLE_ID,
      title: "First Date",
      date: new Date(today - 180 * day).toISOString().slice(0, 10),
      icon: "🌹",
      createdAt: today - 180 * day,
    },
    "m2": {
      coupleId: DEMO_COUPLE_ID,
      title: "Moved In Together",
      date: new Date(today - 60 * day).toISOString().slice(0, 10),
      icon: "🏠",
      createdAt: today - 60 * day,
    },
    "m3": {
      coupleId: DEMO_COUPLE_ID,
      title: "Adopted Milo",
      date: new Date(today - 30 * day).toISOString().slice(0, 10),
      icon: "🐱",
      createdAt: today - 30 * day,
    },
  },
  "couples/demo-couple-1/messages": {
    "msg1": {
      senderId: DEMO_PARTNER_ID,
      text: "Morning love! Big day — the quiz is waiting for you 📝",
      timestamp: today - 2 * day,
      readBy: [DEMO_PARTNER_ID],
    },
    "msg2": {
      senderId: DEMO_USER_ID,
      text: "Haha I saw! 85% though 👑",
      timestamp: today - 2 * day + 3600 * 1000,
      readBy: [DEMO_USER_ID, DEMO_PARTNER_ID],
    },
    "msg3": {
      senderId: DEMO_PARTNER_ID,
      text: "Oh it's ON. Rematch tonight?",
      timestamp: today - day,
      readBy: [DEMO_USER_ID, DEMO_PARTNER_ID],
    },
    "msg4": {
      senderId: DEMO_USER_ID,
      text: "Deal. Same time, same place 💛",
      timestamp: today - day + 1800 * 1000,
      readBy: [DEMO_USER_ID, DEMO_PARTNER_ID],
    },
  },
  "quizzes": {
    "q1": {
      creatorId: DEMO_USER_ID,
      title: "How Well Do You Know Me?",
      description: "The classic — 10 questions about your partner's everyday life.",
      isPublic: true,
      createdAt: today - 30 * day,
      questions: [
        { q: "What is my ideal way to unwind?", type: "text" },
        { q: "How do I take my coffee?", type: "text" },
        { q: "Dream destination?", type: "text" },
        { q: "Best time of day for deep talks?", type: "text" },
      ],
    },
    "q2": {
      creatorId: DEMO_PARTNER_ID,
      title: "Date Night Preferences",
      description: "Plan the perfect night — without asking.",
      isPublic: true,
      createdAt: today - 25 * day,
      questions: [
        { q: "Home-cooked or going out?", type: "text" },
        { q: "Movie genre pick?", type: "text" },
        { q: "Sweet or savory treats?", type: "text" },
      ],
    },
    "q3": {
      creatorId: DEMO_USER_ID,
      title: "Love Languages",
      description: "How do we actually show up for each other?",
      isPublic: true,
      createdAt: today - 20 * day,
      questions: [
        { q: "What makes me feel most loved?", type: "text" },
        { q: "How do I apologize best?", type: "text" },
        { q: "My favorite compliment?", type: "text" },
      ],
    },
  },
  "achievements/demo-user-1/items": {
    "first-quiz": {
      id: "first-quiz",
      title: "First Quiz",
      description: "Completed your first quiz together",
      unlockedAt: today - 15 * day,
    },
    "streak-7": {
      id: "streak-7",
      title: "7-Day Streak",
      description: "Kept the spark alive for 7 straight days",
      unlockedAt: today - 8 * day,
    },
    "memory-maker": {
      id: "memory-maker",
      title: "Memory Maker",
      description: "Captured your first shared memory",
      unlockedAt: today - 40 * day,
    },
    "chatty-couple": {
      id: "chatty-couple",
      title: "Chatty Couple",
      description: "Sent 25 messages in a week",
      unlockedAt: today - 6 * day,
    },
    "perfect-score": {
      id: "perfect-score",
      title: "Perfect Score",
      description: "Scored 100% on a quiz",
      unlockedAt: today - 12 * day,
    },
  },
  "pairingCodes": {
    "DEMO-2024": {
      userId: DEMO_USER_ID,
      createdAt: today - 100 * day,
    },
  },
};