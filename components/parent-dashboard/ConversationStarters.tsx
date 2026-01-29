'use client';

interface ConversationStartersProps {
  childName: string;
  currentChapter: string;
}

export function ConversationStarters({ childName, currentChapter }: ConversationStartersProps) {
  const starters: Record<string, string[]> = {
    identity: [
      `What makes ${childName} unique as an athlete?`,
      `What 3 words would ${childName}'s teammates use to describe them?`,
      `If ${childName} could be sponsored by any brand, which would they choose?`,
      `What does ${childName} want to be known for?`
    ],
    business: [
      `Ask ${childName} what a "red flag" in an NIL deal looks like`,
      `What would ${childName} do if someone offered them a deal today?`,
      `Does ${childName} know who to talk to before signing anything?`,
      `What questions should ${childName} ask about any NIL opportunity?`
    ],
    money: [
      `Does ${childName} know what percentage of NIL money goes to taxes?`,
      `Ask ${childName} what a 1099 form is`,
      `What would ${childName} do with their first NIL payment?`,
      `Does ${childName} know the importance of saving?`
    ],
    legacy: [
      `Where does ${childName} want to be in 10 years?`,
      `What kind of impact does ${childName} want to have?`,
      `Who is an athlete ${childName} admires and why?`,
      `What does ${childName} want to be remembered for?`
    ]
  };

  const currentStarters = starters[currentChapter] || starters.identity;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-orange-50 rounded-xl p-5 border border-purple-100">
      <h3 className="font-bold flex items-center gap-2 mb-4">
        💡 Talk to {childName} About...
      </h3>

      <div className="space-y-3">
        {currentStarters.slice(0, 3).map((starter, idx) => (
          <div
            key={idx}
            className="bg-white/70 rounded-lg p-3 text-sm text-gray-700"
          >
            • {starter}
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500 mt-4">
        These questions relate to what {childName} is currently learning in the {currentChapter.charAt(0).toUpperCase() + currentChapter.slice(1)} chapter.
      </p>
    </div>
  );
}

export default ConversationStarters;
