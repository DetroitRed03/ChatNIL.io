import {
  Sparkles,
  Lightbulb,
  Shield,
  TrendingUp,
  GraduationCap,
  Users,
  DollarSign,
  FileText,
  BookOpen,
  type LucideIcon,
} from 'lucide-react';

// ─── Chat Page Content ───────────────────────────────────────────────

export interface ChatContent {
  headline: string;
  subheadline: string;
  prompts: string[];
  capabilities: { icon: LucideIcon; title: string; description: string }[];
}

const CHAT_CONTENT: Record<string, ChatContent> = {
  hs_student: {
    headline: 'Your AI NIL Coach',
    subheadline:
      "Learn the basics of NIL so you're ready when opportunities come. Ask me anything!",
    prompts: [
      'What is NIL and can high schoolers participate?',
      'What are the NIL rules in my state?',
      'How do I start building my personal brand?',
      'How do I know if a brand deal offer is legit?',
    ],
    capabilities: [
      { icon: GraduationCap, title: 'NIL Education', description: "Learn NIL rules, branding, and what's allowed in your state" },
      { icon: Shield, title: 'Scam Protection', description: 'Spot fake offers and protect yourself from bad deals' },
      { icon: TrendingUp, title: 'Brand Building', description: 'Grow your social media and build your personal brand' },
      { icon: Users, title: 'Parent Guidance', description: 'Help your parents understand NIL so they can support you' },
    ],
  },
  college_athlete: {
    headline: 'Your AI-Powered NIL Companion',
    subheadline:
      'Get expert guidance on NIL rules, contract negotiations, tax implications, and eligibility requirements.',
    prompts: [
      'Explain NIL compliance rules for college athletes',
      'How do I evaluate a brand deal offer?',
      'What are the tax implications of NIL income?',
      'Help me understand NCAA eligibility requirements',
    ],
    capabilities: [
      { icon: Shield, title: 'Compliance Guidance', description: 'Get expert advice on NIL regulations and NCAA rules' },
      { icon: TrendingUp, title: 'Deal Evaluation', description: 'Analyze brand partnerships and sponsorship opportunities' },
      { icon: Lightbulb, title: 'Educational Resources', description: 'Learn about contracts, taxes, and legal requirements' },
      { icon: Sparkles, title: 'Personalized Support', description: 'Tailored guidance for your specific deals and situation' },
    ],
  },
  parent: {
    headline: 'NIL Guidance for Parents',
    subheadline:
      'Understand NIL rules and help your child navigate opportunities safely.',
    prompts: [
      'What do I need to know about NIL as a parent?',
      'How do I protect my child from scam offers?',
      'What are the tax implications if my child earns NIL money?',
      'Can high schoolers do NIL deals in our state?',
    ],
    capabilities: [
      { icon: Shield, title: 'Protection First', description: 'Learn to identify red flags and protect your child' },
      { icon: FileText, title: 'Contract Help', description: 'Understand what to look for before signing anything' },
      { icon: DollarSign, title: 'Tax & Legal', description: 'Understand financial and legal responsibilities' },
      { icon: Users, title: 'Family Guidance', description: "How to support your athlete's NIL journey together" },
    ],
  },
  compliance_officer: {
    headline: 'NIL Compliance Assistant',
    subheadline:
      'Get help with deal review, regulatory guidance, and institutional compliance.',
    prompts: [
      'What should I check when reviewing a new NIL deal?',
      'How do state disclosure deadlines work?',
      'What are the red flags for pay-for-play?',
      'Help me prepare an audit report',
    ],
    capabilities: [
      { icon: Shield, title: 'Deal Review', description: 'Analyze deals for compliance risks and policy violations' },
      { icon: BookOpen, title: 'Regulatory Reference', description: 'NCAA, state law, and institutional policy guidance' },
      { icon: FileText, title: 'Audit Support', description: 'Generate reports and document compliance decisions' },
      { icon: Sparkles, title: 'Risk Detection', description: 'Identify FMV issues, prohibited industries, and red flags' },
    ],
  },
};

export function getChatContent(role?: string): ChatContent {
  if (role && CHAT_CONTENT[role]) return CHAT_CONTENT[role];
  return CHAT_CONTENT.college_athlete;
}

// ─── Floating Widget Content ─────────────────────────────────────────

export interface WidgetContent {
  title: string;
  subtitle: string;
  description: string;
  cta: string;
}

const WIDGET_CONTENT: Record<string, WidgetContent> = {
  hs_student: {
    title: 'AI NIL Coach',
    subtitle: 'Your personal guide',
    description: 'Got questions about NIL, branding, or what deals you can do? Ask me anything.',
    cta: 'Ask a Question',
  },
  college_athlete: {
    title: 'AI NIL Coach',
    subtitle: 'Expert guidance 24/7',
    description: 'Ask about contracts, compliance, taxes, and NIL strategies for your deals.',
    cta: 'Start Conversation',
  },
  athlete: {
    title: 'AI NIL Coach',
    subtitle: 'Expert guidance 24/7',
    description: 'Ask about contracts, compliance, taxes, and NIL strategies for your deals.',
    cta: 'Start Conversation',
  },
  parent: {
    title: 'NIL Parent Guide',
    subtitle: 'Protect & support',
    description: "Get answers about your child's NIL deals, contracts, and legal protections.",
    cta: 'Get Guidance',
  },
  compliance_officer: {
    title: 'Compliance AI',
    subtitle: 'Review assistant',
    description: 'Get help reviewing deals, checking regulations, and generating reports.',
    cta: 'Open Assistant',
  },
};

export function getWidgetContent(role?: string): WidgetContent {
  if (role && WIDGET_CONTENT[role]) return WIDGET_CONTENT[role];
  return WIDGET_CONTENT.college_athlete;
}
