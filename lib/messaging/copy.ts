/**
 * Messaging Copy Library
 *
 * All user-facing text for the messaging system.
 * Provided by @GRIOT for consistent voice and tone.
 */

export const MESSAGING_COPY = {
  // Empty States
  emptyStates: {
    noConversations: {
      title: "No conversations yet",
      description: "Start a conversation with a matched athlete or agency to begin building partnerships.",
    },
    noMessages: {
      title: "No messages yet",
      description: "Send a message to start the conversation",
    },
    selectConversation: {
      title: "Select a conversation",
      description: "Choose a conversation from the sidebar to start messaging with matched athletes or agencies",
      tips: {
        title: "Tips for effective messaging:",
        items: [
          "Be professional and courteous",
          "Respond promptly to maintain engagement",
          "Share relevant opportunities and details",
        ],
      },
    },
  },

  // Error Messages
  errors: {
    loadConversations: "Unable to load conversations. Please check your connection and try again.",
    loadMessages: "Unable to load messages. Please refresh the page.",
    sendMessage: "Message failed to send. Please try again.",
    markRead: "Unable to mark messages as read. Please try again.",
    unauthorized: "You don't have permission to access this conversation.",
    notFound: "This conversation no longer exists.",
    networkError: "Network error. Please check your connection.",
    generic: "Something went wrong. Please try again.",
  },

  // Loading States
  loading: {
    conversations: "Loading conversations...",
    messages: "Loading messages...",
    sending: "Sending...",
    loadingMore: "Loading more messages...",
  },

  // Actions
  actions: {
    send: "Send",
    retry: "Retry",
    cancel: "Cancel",
    refresh: "Refresh",
    back: "Back to conversations",
    markAllRead: "Mark all as read",
  },

  // Placeholders
  placeholders: {
    messageInput: "Type a message...",
    search: "Search conversations...",
  },

  // Helper Text
  helperText: {
    keyboardShortcuts: "Press Enter to send, Shift+Enter for new line",
    characterLimit: "characters remaining",
    typing: "is typing...",
    readReceipt: "Read",
    delivered: "Delivered",
  },

  // Time Formatting
  time: {
    justNow: "Just now",
    today: "Today",
    yesterday: "Yesterday",
    minutesAgo: (minutes: number) => `${minutes}m ago`,
    hoursAgo: (hours: number) => `${hours}h ago`,
  },

  // Match Tiers
  matchTiers: {
    platinum: "Platinum Match",
    gold: "Gold Match",
    silver: "Silver Match",
    bronze: "Bronze Match",
  },

  // Roles
  roles: {
    athlete: "Athlete",
    agency: "Agency",
    parent: "Parent",
    coach: "Coach",
  },

  // Notifications
  notifications: {
    newMessage: (senderName: string) => `New message from ${senderName}`,
    messagesMarkedRead: "Messages marked as read",
    conversationArchived: "Conversation archived",
  },

  // First Messages (Conversation Starters)
  conversationStarters: {
    athlete: {
      toAgency: [
        "Hi! I'm interested in learning more about partnership opportunities.",
        "Hello! I'd love to discuss potential NIL collaborations.",
        "Hi there! Thanks for reaching out. I'm excited to explore working together.",
      ],
    },
    agency: {
      toAthlete: [
        "Hi [Name]! We're impressed by your profile and would love to discuss partnership opportunities.",
        "Hello! We think you'd be a great fit for our brand campaigns. Let's connect!",
        "Hi [Name]! We have some exciting NIL opportunities that align with your profile.",
      ],
    },
  },

  // Onboarding/Tutorial
  tutorial: {
    title: "Welcome to Messages",
    steps: [
      {
        title: "Connect with matches",
        description: "Message athletes or agencies you've been matched with to explore opportunities.",
      },
      {
        title: "Stay responsive",
        description: "Quick responses help build trust and move conversations forward.",
      },
      {
        title: "Be professional",
        description: "All messages are part of your professional reputation. Keep it courteous and relevant.",
      },
    ],
  },

  // Guidelines
  guidelines: {
    title: "Messaging Guidelines",
    items: [
      "Keep all NIL discussions compliant with state and NCAA regulations",
      "Be respectful and professional in all communications",
      "Share only verified and accurate information",
      "Protect personal and financial information",
      "Report any suspicious or inappropriate messages",
    ],
  },

  // Status Messages
  status: {
    online: "Online",
    offline: "Offline",
    away: "Away",
    lastSeen: (time: string) => `Last seen ${time}`,
  },
};

// Utility functions for dynamic copy
export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

export const getConversationStarter = (role: string, targetRole: string) => {
  if (role === "athlete" && targetRole === "agency") {
    const starters = MESSAGING_COPY.conversationStarters.athlete.toAgency;
    return starters[Math.floor(Math.random() * starters.length)];
  }
  if (role === "agency" && targetRole === "athlete") {
    const starters = MESSAGING_COPY.conversationStarters.agency.toAthlete;
    return starters[Math.floor(Math.random() * starters.length)];
  }
  return "Hi! Looking forward to connecting with you.";
};

export const formatUnreadCount = (count: number): string => {
  if (count === 0) return "";
  if (count > 99) return "99+";
  return count.toString();
};

export const getMessagePreview = (content: string, maxLength: number = 60): string => {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + "...";
};
