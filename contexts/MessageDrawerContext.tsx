'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface RecipientInfo {
  id: string;
  name: string;
  avatar?: string;
  handle?: string;
  meta?: string; // e.g., "Basketball • UCLA"
  profileUrl?: string;
}

interface MessageDrawerContextType {
  isOpen: boolean;
  recipient: RecipientInfo | null;
  threadId: string | null;
  openDrawer: (recipient: RecipientInfo) => void;
  closeDrawer: () => void;
  setThreadId: (id: string | null) => void;
}

const MessageDrawerContext = createContext<MessageDrawerContextType | null>(null);

export function MessageDrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [recipient, setRecipient] = useState<RecipientInfo | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);

  const openDrawer = useCallback((newRecipient: RecipientInfo) => {
    setRecipient(newRecipient);
    setThreadId(null); // Reset thread - will be fetched/created when drawer opens
    setIsOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsOpen(false);
    // Delay clearing recipient for exit animation
    setTimeout(() => {
      setRecipient(null);
      setThreadId(null);
    }, 300);
  }, []);

  return (
    <MessageDrawerContext.Provider
      value={{
        isOpen,
        recipient,
        threadId,
        openDrawer,
        closeDrawer,
        setThreadId,
      }}
    >
      {children}
    </MessageDrawerContext.Provider>
  );
}

export function useMessageDrawer() {
  const context = useContext(MessageDrawerContext);
  if (!context) {
    throw new Error('useMessageDrawer must be used within MessageDrawerProvider');
  }
  return context;
}
