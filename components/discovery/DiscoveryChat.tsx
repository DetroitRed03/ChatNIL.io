'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PillarProgress } from './PillarProgress';
import { ChapterUnlock } from './ChapterUnlock';
import { DiscoveryQuestion, PILLARS, PillarType, getProgressPercentage, getPillarProgress } from '@/lib/discovery/questions';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
  questionId?: string;
}

interface DiscoveryState {
  currentPillar: PillarType;
  currentDay: number;
  currentQuestionNumber: number;
  answersGiven: Record<string, string>;
  unlockedChapters: PillarType[];
  isComplete: boolean;
}

interface DiscoveryChatProps {
  initialState?: DiscoveryState;
  onStateChange?: (state: DiscoveryState) => void;
}

export function DiscoveryChat({ initialState, onStateChange }: DiscoveryChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [discoveryState, setDiscoveryState] = useState<DiscoveryState>(
    initialState || {
      currentPillar: 'identity',
      currentDay: 1,
      currentQuestionNumber: 1,
      answersGiven: {},
      unlockedChapters: [],
      isComplete: false,
    }
  );
  const [showChapterUnlock, setShowChapterUnlock] = useState(false);
  const [unlockedPillar, setUnlockedPillar] = useState<PillarType | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<DiscoveryQuestion | null>(null);
  const [showChoices, setShowChoices] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load initial state and first question
  useEffect(() => {
    loadCurrentState();
  }, []);

  const loadCurrentState = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/discovery/current-state');
      const data = await response.json();

      if (data.state) {
        setDiscoveryState(data.state);
      }

      if (data.currentQuestion) {
        setCurrentQuestion(data.currentQuestion);
        setShowChoices(data.currentQuestion.responseType !== 'text');

        // Add welcome message if this is the start
        if (data.isNewSession) {
          addAssistantMessage(getWelcomeMessage());
          setTimeout(() => {
            addAssistantMessage(data.currentQuestion.question, data.currentQuestion.id);
          }, 1500);
        } else if (data.messages && data.messages.length > 0) {
          // Load previous messages
          setMessages(data.messages);
          // Add current question if not already there
          const lastMessage = data.messages[data.messages.length - 1];
          if (lastMessage?.role !== 'assistant' || lastMessage?.questionId !== data.currentQuestion.id) {
            setTimeout(() => {
              addAssistantMessage(data.currentQuestion.question, data.currentQuestion.id);
            }, 500);
          }
        } else {
          addAssistantMessage(data.currentQuestion.question, data.currentQuestion.id);
        }
      }
    } catch (error) {
      console.error('Error loading discovery state:', error);
      addAssistantMessage("Hey there! Looks like we hit a small snag. Let's try refreshing the page.");
    } finally {
      setIsLoading(false);
    }
  };

  const getWelcomeMessage = () => {
    return `Hey! 👋 Welcome to your NIL Discovery Journey! I'm your guide, and over the next few weeks, we're going to figure out what makes YOU unique as an athlete.

This isn't a quiz or a test - just a conversation. Your answers help us personalize everything for you. Ready to get started?`;
  };

  const addAssistantMessage = (content: string, questionId?: string) => {
    const message: Message = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content,
      timestamp: new Date(),
      questionId,
    };
    setMessages((prev) => [...prev, message]);
  };

  const addUserMessage = (content: string) => {
    const message: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, message]);
  };

  const handleSubmit = async (answer?: string) => {
    const responseText = answer || inputValue.trim();
    if (!responseText || isLoading) return;

    setInputValue('');
    setShowChoices(false);
    addUserMessage(responseText);
    setIsLoading(true);

    try {
      const response = await fetch('/api/discovery/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answer: responseText,
          questionId: currentQuestion?.id,
        }),
      });

      const data = await response.json();

      if (data.error) {
        addAssistantMessage("Hmm, something went wrong. Let's try that again!");
        return;
      }

      // Update state
      if (data.newState) {
        setDiscoveryState(data.newState);
        onStateChange?.(data.newState);
      }

      // Check for chapter unlock
      if (data.chapterUnlocked) {
        setUnlockedPillar(data.chapterUnlocked);
        setShowChapterUnlock(true);
      }

      // Add acknowledgment message
      if (data.acknowledgment) {
        addAssistantMessage(data.acknowledgment);
      }

      // Add next question after a delay
      if (data.nextQuestion) {
        setCurrentQuestion(data.nextQuestion);
        setTimeout(() => {
          addAssistantMessage(data.nextQuestion.question, data.nextQuestion.id);
          setShowChoices(data.nextQuestion.responseType !== 'text');
        }, 1500);
      } else if (data.isComplete) {
        setTimeout(() => {
          addAssistantMessage(getCompletionMessage());
        }, 1500);
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      addAssistantMessage("Oops! Something went wrong. Let's try that again.");
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const getCompletionMessage = () => {
    return `🎉 WOW! You've completed your entire Discovery Journey!

You've unlocked all 4 chapters:
✅ Identity - Who You Are
✅ Business - The Rules
✅ Money - Financial Foundations
✅ Legacy - Your Future

You now have a complete profile that will help you navigate NIL opportunities like a pro. Check out your dashboard to see everything we've learned about you!`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCloseChapterUnlock = () => {
    setShowChapterUnlock(false);
    setUnlockedPillar(null);
  };

  const totalProgress = getProgressPercentage(
    discoveryState.currentPillar,
    discoveryState.currentDay,
    discoveryState.currentQuestionNumber
  );

  const pillarProgress = getPillarProgress(
    discoveryState.currentPillar,
    discoveryState.currentDay,
    discoveryState.currentQuestionNumber
  );

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-900 via-gray-900 to-black">
      {/* Header with Progress */}
      <div className="flex-shrink-0 p-4 border-b border-gray-800">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-400" />
              <h1 className="text-lg font-semibold text-white">Discovery Journey</h1>
            </div>
            <div className="text-sm text-gray-400">
              {totalProgress}% Complete
            </div>
          </div>
          <PillarProgress
            currentPillar={discoveryState.currentPillar}
            currentDay={discoveryState.currentDay}
            unlockedChapters={discoveryState.unlockedChapters}
            pillarProgress={pillarProgress}
          />
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-100'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-gray-800 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                  <span className="text-gray-400">Thinking...</span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Response Choices */}
      {showChoices && currentQuestion?.choices && (
        <div className="flex-shrink-0 px-4 pb-2">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-wrap gap-2">
              {currentQuestion.choices.map((choice) => (
                <Button
                  key={choice}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSubmit(choice)}
                  disabled={isLoading}
                  className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                >
                  {choice}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="flex-shrink-0 p-4 border-t border-gray-800">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer..."
              disabled={isLoading}
              className="flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
            />
            <Button
              onClick={() => handleSubmit()}
              disabled={!inputValue.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Currently exploring: {PILLARS[discoveryState.currentPillar].title} (Day {discoveryState.currentDay})
          </p>
        </div>
      </div>

      {/* Chapter Unlock Modal */}
      {showChapterUnlock && unlockedPillar && (
        <ChapterUnlock
          pillar={unlockedPillar}
          onClose={handleCloseChapterUnlock}
        />
      )}
    </div>
  );
}
