/**
 * Test AI Chat Endpoint
 * Tests the new /api/chat/ai endpoint with different user roles
 */

async function testAIChat() {
  console.log('🧪 Testing AI Chat API\n');

  const tests = [
    {
      name: 'Athlete - Simple Question',
      request: {
        messages: [{ role: 'user', content: "What's an NIL deal?" }],
        userRole: 'athlete',
        userName: 'Sarah'
      }
    },
    {
      name: 'Parent - Legal Question',
      request: {
        messages: [{ role: 'user', content: 'Should we hire a lawyer for NIL contracts?' }],
        userRole: 'parent',
        athleteName: 'Sarah'
      }
    },
    {
      name: 'Athlete - State-Specific',
      request: {
        messages: [{ role: 'user', content: 'What are the NIL rules in California?' }],
        userRole: 'athlete',
        userState: 'CA'
      }
    },
    {
      name: 'Coach - Compliance',
      request: {
        messages: [{ role: 'user', content: 'Can I help my athletes find NIL deals?' }],
        userRole: 'coach',
        sport: 'Basketball'
      }
    }
  ];

  for (const test of tests) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Test: ${test.name}`);
    console.log('='.repeat(60));
    console.log(`Role: ${test.request.userRole}`);
    console.log(`Query: "${test.request.messages[0].content}"`);
    console.log('');

    try {
      const response = await fetch('http://localhost:3000/api/chat/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test.request)
      });

      if (!response.ok) {
        const error = await response.json();
        console.log('❌ Error:', error);
        continue;
      }

      // Read streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        console.log('❌ No response body');
        continue;
      }

      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.token) {
                process.stdout.write(parsed.token);
                fullResponse += parsed.token;
              }
            } catch (e) {
              // Skip parsing errors
            }
          }
        }
      }

      console.log('\n');
      console.log(`✅ Response complete (${fullResponse.length} chars)`);

    } catch (error: any) {
      console.log('❌ Request failed:', error.message);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 AI Chat API Testing Complete!');
  console.log('='.repeat(60));
}

testAIChat();
