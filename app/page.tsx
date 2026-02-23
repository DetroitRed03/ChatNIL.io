'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/brand/Logo';
import { Sparkles, Lightbulb, Shield, TrendingUp, ArrowRight, MessageSquare, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthModal from '@/components/AuthModal';
import { UserRole } from '@/types';

// Suggested prompts for the splash page
const EXAMPLE_PROMPTS = [
  "Explain NIL compliance rules for college athletes",
  "How do I evaluate a brand deal offer?",
  "What are the tax implications of NIL income?",
  "Help me understand NCAA eligibility requirements"
];

const CAPABILITIES = [
  {
    icon: Shield,
    title: "Compliance Guidance",
    description: "Get expert advice on NIL regulations and NCAA rules"
  },
  {
    icon: TrendingUp,
    title: "Deal Evaluation",
    description: "Analyze brand partnerships and sponsorship opportunities"
  },
  {
    icon: Lightbulb,
    title: "Educational Resources",
    description: "Learn about contracts, taxes, and legal requirements"
  },
  {
    icon: Sparkles,
    title: "Personalized Support",
    description: "Tailored guidance for athletes, parents, and coaches"
  }
];

function SplashPage() {
  const { user, login, signup } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const router = useRouter();
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'login' | 'signup' }>({
    isOpen: false,
    mode: 'login'
  });

  const handlePromptClick = (prompt: string) => {
    if (!user) {
      router.push('/signup');
      return;
    }
    setInputValue(prompt);
  };

  const handleGetStarted = () => {
    // If not logged in, redirect to new signup flow
    if (!user) {
      router.push('/signup');
      return;
    }
    // If logged in, redirect based on role
    if (user.role === 'agency') {
      router.push('/agency/dashboard');
    } else {
      router.push('/dashboard');
    }
  };

  const handleLogin = async (email: string, password: string) => {
    const result = await login(email, password);
    if (result.error) {
      alert('Login failed: ' + result.error);
    } else {
      setAuthModal({ isOpen: false, mode: 'login' });
    }
  };

  const handleSignup = async (name: string, email: string, password: string, role: UserRole) => {
    const result = await signup({
      name,
      email,
      password,
      role,
      profileData: {}
    });
    if (result.error) {
      alert('Signup failed: ' + result.error);
    } else {
      setAuthModal({ isOpen: false, mode: 'signup' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 border-b border-border bg-background-card/50 backdrop-blur-sm">
        <Logo size="md" variant="full" href="/" />
        <div className="flex gap-3">
          <button
            onClick={() => setAuthModal({ isOpen: true, mode: 'login' })}
            className="px-4 py-2 text-text-secondary hover:text-text-primary border border-border rounded-lg hover:bg-background-hover transition-colors"
          >
            Log in
          </button>
          <button
            onClick={() => router.push('/signup')}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors shadow-sm hover:shadow-md"
          >
            Sign up
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-3xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center shadow-lg">
                <MessageSquare className="h-9 w-9 text-white" />
              </div>
              <h1 className="text-5xl font-bold text-text-primary">ChatNIL</h1>
            </div>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
              Your AI-Powered NIL Companion
            </p>
            <p className="text-base text-text-tertiary max-w-xl mx-auto mt-3">
              Get expert guidance on Name, Image, and Likeness rules, contract negotiations, tax implications, and eligibility requirements.
            </p>
          </div>

          {/* Chat Input */}
          <div className="mb-12">
            <div className="relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleGetStarted();
                  }
                }}
                placeholder="Ask me anything about NIL..."
                className="w-full px-6 py-4 pr-14 border border-border rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-background-card text-text-primary placeholder-text-muted shadow-lg hover:shadow-xl focus:shadow-xl transition-all"
                rows={1}
                style={{
                  minHeight: '60px',
                  maxHeight: '200px'
                }}
              />
              <button
                onClick={handleGetStarted}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center"
                aria-label="Send message"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Example Prompts */}
          <div className="mb-16">
            <h3 className="text-sm font-semibold text-text-tertiary uppercase tracking-wide mb-4 text-center">
              Try asking about
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {EXAMPLE_PROMPTS.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handlePromptClick(prompt)}
                  className="group px-4 py-3 text-left border border-border rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all text-sm text-text-secondary hover:text-primary-600 bg-background-card"
                >
                  <span className="block">{prompt}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Capabilities */}
          <div>
            <h3 className="text-sm font-semibold text-text-tertiary uppercase tracking-wide mb-6 text-center">
              What ChatNIL can do
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {CAPABILITIES.map((capability, index) => {
                const Icon = capability.icon;
                return (
                  <div
                    key={index}
                    className="p-5 border border-border rounded-xl bg-background-card hover:border-primary-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-text-primary mb-1">
                          {capability.title}
                        </h4>
                        <p className="text-sm text-text-tertiary">
                          {capability.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-6 border-t border-border bg-background-card/50">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-text-tertiary">
            ChatNIL is powered by advanced AI to provide NIL guidance. Always consult with legal and financial professionals for official advice.
          </p>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModal.isOpen}
        initialMode={authModal.mode}
        onClose={() => setAuthModal({ isOpen: false, mode: 'login' })}
        onLogin={handleLogin}
        onSignup={handleSignup}
      />
    </div>
  );
}

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Redirect authenticated users to their appropriate dashboard
  useEffect(() => {
    if (!isLoading && user) {
      setIsRedirecting(true);
      if (user.role === 'agency') {
        router.replace('/agency/dashboard');
      } else {
        // Redirect athletes, parents, coaches to athlete dashboard
        router.replace('/dashboard');
      }
    }
  }, [user, isLoading, router]);

  // Show loading state while checking authentication or redirecting
  if (isLoading || isRedirecting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            {isRedirecting ? 'Redirecting...' : 'Loading ChatNIL'}
          </h3>
          <p className="text-sm text-text-secondary">
            {isRedirecting ? 'Taking you to your dashboard' : 'Please wait...'}
          </p>
        </div>
      </div>
    );
  }

  // Only show splash page for non-authenticated users
  return <SplashPage />;
}
