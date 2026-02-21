// Discovery AI Prompts - System prompts for conversational discovery

import { DiscoveryQuestion, PILLARS, PillarType } from './questions';

// Main system prompt for the Discovery conversation
export const DISCOVERY_SYSTEM_PROMPT = `You are an NIL (Name, Image, Likeness) discovery coach chatting with a high school student athlete.

CRITICAL RESPONSE LENGTH RULE:
- Acknowledgments: 1-2 sentences ONLY. Never more.
- NO bullet points, numbered lists, or multi-paragraph responses.
- These are teenagers — keep it short, real, and encouraging.

Your role:
1. Ask ONE question at a time
2. Acknowledge answers warmly in 1-2 sentences, then move on
3. Guide them through personal brand, NIL rules, financial literacy, and legacy
4. Be encouraging but not over-the-top

Tone:
- Friendly mentor, like a cool older sibling
- Conversational, curious about THEM
- Occasionally playful, always respectful
- Age-appropriate for 14-18 year olds

NEVER:
- Ask multiple questions at once
- Give lectures or write essays
- Use bullet points or numbered lists in acknowledgments
- Use corporate jargon
- Be condescending
- Mention that you're an AI
- Reference "NIL rules" in early identity questions (save for Business pillar)`;

// Get acknowledgment prompt for a specific answer
export function getAcknowledgmentPrompt(
  question: DiscoveryQuestion,
  answer: string
): string {
  const pillarContext = PILLARS[question.pillar];

  return `The student was asked: "${question.question}"
They responded: "${answer}"

Generate a warm acknowledgment in EXACTLY 1-2 sentences that:
1. Shows you heard them (don't repeat what they said)
2. Adds one small insight or connection
3. Transitions naturally to what's next

STRICT: Maximum 2 sentences. No lists. No paragraphs. No lectures.

Context: Day ${question.day} of "${pillarContext.name}" (${pillarContext.description}).`;
}

// Get data extraction prompt
export function getDataExtractionPrompt(
  question: DiscoveryQuestion,
  answer: string
): string {
  return `Question asked: "${question.question}"
User's response: "${answer}"

Extraction instructions: ${question.extractionPrompt}

Extract the relevant data and return as JSON. The main field should be "${question.dataField}".

For example outputs:
- If extracting a sport: {"${question.dataField}": "Basketball"}
- If extracting multiple items: {"${question.dataField}": ["Instagram", "TikTok"]}
- If extracting a scale value: {"${question.dataField}": 7}
- If extracting free text: {"${question.dataField}": "meaningful excerpt or summary"}

Return ONLY the JSON object with the extracted data.`;
}

// Get pillar intro message
export function getPillarIntroMessage(pillar: PillarType): string {
  const intros: Record<PillarType, string> = {
    identity: `Awesome! Let's start with the fun stuff - getting to know YOU! 🎯

Over the next few days, we're going to explore what makes you unique as an athlete and as a person. This is the foundation of your personal brand - and trust me, you've already got one, whether you realize it or not!

Ready to discover what makes you, YOU?`,

    business: `Nice work completing the Identity chapter! 📋

Now let's talk business. Don't worry - this isn't boring business class stuff. We're going to explore NIL rules through real scenarios and help you spot opportunities (and red flags).

By the end of this week, you'll know way more than most high school athletes about how this all works!`,

    money: `You're crushing it! Time to talk about everyone's favorite topic - money! 💰

This week we're building your financial foundation. Whether you make $100 or $100,000 from NIL, these skills will help you manage it wisely.

Let's see where you're starting from!`,

    legacy: `Last pillar - and honestly, my favorite! 🌟

We've figured out who you are, how the business works, and how to handle money. Now let's dream big about the impact you want to make.

What do you want your legacy to be?`,
  };

  return intros[pillar];
}

// Get day transition message
export function getDayTransitionMessage(pillar: PillarType, day: number): string {
  const dayMessages: Record<PillarType, Record<number, string>> = {
    identity: {
      2: "Great first day! Today we're diving into your online presence and how you show up on social media.",
      3: "Day 3! Let's explore your leadership style and what your teammates think of you.",
      4: "We're getting to the good stuff now - your values and what kinds of brands would be a good fit for you.",
      5: "Final day of Identity! Time to pull it all together into your personal brand statement.",
    },
    business: {
      2: "Day 2! Time for some real scenarios - let's see how you'd handle different NIL situations.",
      3: "Today we're talking about red flags and contracts. Super important stuff!",
      4: "Almost done with Business! Let's cover what types of deals are off-limits.",
      5: "Final Business day! Let's see what you've learned and what else you want to know.",
    },
    money: {
      2: "Day 2 - let's run some numbers and see how you'd handle actual NIL money!",
      3: "Saving and goals day! What are you working toward?",
      4: "Smart money decisions time - let's think through some real scenarios.",
      5: "Final Money day! What financial habits do you want to build?",
    },
    legacy: {
      2: "Day 2 - impact and influence. What causes matter to you?",
      3: "Giving back day! How can you use your platform to help others?",
      4: "Personal growth time - what challenges have shaped you?",
      5: "Final day of your Discovery Journey! Let's define your legacy.",
    },
  };

  return dayMessages[pillar]?.[day] || "Ready for today's questions?";
}

// Get completion message for pillar
export function getPillarCompletionMessage(pillar: PillarType): string {
  const messages: Record<PillarType, string> = {
    identity: `🎯 IDENTITY CHAPTER COMPLETE!

You've done the work to understand what makes you unique. Your personal brand isn't just about sports - it's about everything that makes you, YOU.

Keep this in mind as we move forward - every opportunity should align with who you really are.`,

    business: `📋 BUSINESS CHAPTER COMPLETE!

You now know more about NIL rules than most high school athletes. Remember:
- Always check your state rules
- Never sign without review
- Trust your gut on red flags

This knowledge protects you AND opens doors.`,

    money: `💰 MONEY CHAPTER COMPLETE!

Financial literacy is a superpower. Whether it's $50 or $50,000, you now have the foundation to:
- Budget wisely
- Save for goals
- Make smart decisions

This stuff matters way beyond NIL!`,

    legacy: `🌟 LEGACY CHAPTER COMPLETE!

You've defined what you want to be remembered for. That's powerful.

Your legacy isn't just about what you achieve - it's about the impact you have on others. Start building it today.`,
  };

  return messages[pillar];
}

// Conversation starters for returning users
export function getReturningUserMessage(daysSinceLastVisit: number, pillar: PillarType, day: number): string {
  if (daysSinceLastVisit <= 1) {
    return `Hey! Ready to continue? Let's pick up where we left off.`;
  } else if (daysSinceLastVisit <= 3) {
    return `Welcome back! 👋 We were in the middle of the ${PILLARS[pillar].name} pillar. Ready to keep going?`;
  } else {
    return `Hey stranger! 😄 It's been a few days. No worries - let's pick up where we left off in ${PILLARS[pillar].name}.`;
  }
}
