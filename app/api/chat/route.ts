import { NextRequest, NextResponse } from 'next/server';
import { trackEventServer } from '@/lib/analytics-server';
import { estimateTokenCount, estimateCost, categorizePrompt } from '@/lib/analytics';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  attachments?: any[];
}

interface ChatRequest {
  messages: Message[];
  userId?: string;
  userRole?: string;
}

const NIL_RESPONSES = [
  "NIL (Name, Image, and Likeness) allows student-athletes to profit from their personal brand. This includes sponsorship deals, social media partnerships, autograph signings, and personal appearances. The key is that athletes can now be compensated for their own name, image, and likeness while maintaining eligibility.",

  "For high school athletes, NIL rules vary by state. Some states allow high school NIL activities, while others don't. It's crucial to check your state's specific regulations and your school's athletic association rules. Always consult with your school's athletic director before pursuing any NIL opportunities.",

  "Student-athletes must be careful about NIL compliance. Key rules include: no pay-for-play arrangements, no compensation tied to enrollment at a specific school, proper disclosure of deals, and adherence to your school's NIL policies. When in doubt, consult your school's compliance office.",

  "Building your personal brand for NIL success involves: creating engaging social media content, maintaining academic excellence, developing your athletic skills, networking within your sport, and partnering with reputable brands that align with your values. Authenticity is key to long-term success.",

  "NIL contracts should always be reviewed carefully. Key elements to look for include: payment terms, exclusivity clauses, performance requirements, brand alignment, contract duration, and termination conditions. Consider having a lawyer or agent review any significant deals.",

  "Eligibility is protected under NIL as long as you follow the rules. You can earn money from NIL activities without losing NCAA eligibility, but you must avoid compensation for athletic performance, recruiting inducements, or pay-for-play arrangements. Academic progress is also required.",

  "NIL opportunities for student-athletes include: social media sponsorships, local business partnerships, autograph signings, personal training sessions, sports camps and clinics, merchandise sales, appearance fees, and content creation partnerships. The possibilities are diverse and growing."
];

const SUGGESTIONS = [
  "What's an NIL deal?",
  "Rules for high schoolers",
  "Eligibility requirements",
  "Building my brand",
  "Contract review tips",
  "Compliance guidelines"
];

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body: ChatRequest = await request.json();
    const { messages, userId, userRole } = body;

    console.log('Chat API - Received messages:', messages?.map(m => ({
      role: m.role,
      content: m.content.slice(0, 50) + '...',
      hasAttachments: !!m.attachments?.length
    })));

    if (!messages || !Array.isArray(messages)) {
      console.log('Chat API - Error: Invalid messages array');
      return NextResponse.json(
        { error: 'Invalid request: messages array required' },
        { status: 400 }
      );
    }

    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    console.log('Chat API - Last message:', { role: lastMessage?.role, content: lastMessage?.content?.slice(0, 50) + '...' });

    if (!lastMessage || lastMessage.role !== 'user') {
      console.log('Chat API - Error: Last message is not from user');
      return NextResponse.json(
        { error: 'Invalid request: last message must be from user' },
        { status: 400 }
      );
    }

    // Track AI prompt sent
    const sessionId = `${userId || 'anonymous'}-${Date.now()}`;
    const promptLength = lastMessage.content.length;
    const category = categorizePrompt(lastMessage.content);

    if (userId && userRole) {
      trackEventServer('ai_prompt_sent', {
        user_id: userId,
        role: userRole as any,
        prompt_length: promptLength,
        category,
        session_id: sessionId,
      });
    }

    // Select a random NIL response
    const responseText = NIL_RESPONSES[Math.floor(Math.random() * NIL_RESPONSES.length)];

    // Create a streaming response
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        // Simulate typing delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Split response into words for streaming effect
        const words = responseText.split(' ');

        for (let i = 0; i < words.length; i++) {
          const word = words[i];
          const isLast = i === words.length - 1;

          // Send word with appropriate spacing
          const token = isLast ? word : word + ' ';
          const data = JSON.stringify({ token });
          const chunk = `data: ${data}\n\n`;

          controller.enqueue(encoder.encode(chunk));

          // Add delay between words for realistic typing effect
          await new Promise(resolve => setTimeout(resolve, 80 + Math.random() * 40));
        }

        // Send completion signal
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();

        // Track AI response generated
        const responseTime = Date.now() - startTime;
        const tokenCount = estimateTokenCount(responseText);
        const cost = estimateCost(tokenCount);

        if (userId && userRole) {
          trackEventServer('ai_response_generated', {
            user_id: userId,
            role: userRole as any,
            response_time_ms: responseTime,
            token_count_estimate: tokenCount,
            cost_estimate_usd: cost,
            session_id: sessionId,
          });
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: Handle GET requests to return suggestions
export async function GET() {
  return NextResponse.json({
    suggestions: SUGGESTIONS,
    message: 'ChatNIL API is running. Use POST to send messages.'
  });
}