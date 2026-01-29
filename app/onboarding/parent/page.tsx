'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Loader2, AlertCircle, Mail, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';

export default function ParentOnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const consentToken = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [childInfo, setChildInfo] = useState<{ name: string; email: string } | null>(null);
  const [activeTab, setActiveTab] = useState(consentToken ? 'consent' : 'direct');

  const [formData, setFormData] = useState({
    fullName: '',
    childEmail: '',
  });

  // If consent token is present, fetch child info
  useEffect(() => {
    if (consentToken) {
      fetchChildInfo();
    }
  }, [consentToken]);

  const fetchChildInfo = async () => {
    try {
      const response = await fetch(`/api/parent/verify-token?token=${consentToken}`);
      if (response.ok) {
        const data = await response.json();
        setChildInfo(data.child);
      } else {
        setError('Invalid or expired consent link. Please ask your child to resend the consent request.');
      }
    } catch (err) {
      setError('Failed to verify consent link.');
    }
  };

  const handleDirectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/onboarding/parent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          childEmail: formData.childEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete onboarding');
      }

      if (data.childLinked) {
        setSuccessMessage('Your account is now linked to your child\'s account.');
        setTimeout(() => router.push('/parent/dashboard'), 2000);
      } else {
        setSuccessMessage('We\'ve sent a link request to your child\'s email.');
        setTimeout(() => router.push('/parent/dashboard'), 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsLoading(false);
    }
  };

  const handleConsentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/onboarding/parent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          consentToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete onboarding');
      }

      setSuccessMessage('Consent approved! Your child can now access ChatNIL.');
      setTimeout(() => router.push('/parent/dashboard'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full"
      >
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/onboarding/role-selection')}
              className="w-fit mb-4 text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <CardTitle className="text-2xl text-white">Parent/Guardian Profile</CardTitle>
            <CardDescription className="text-gray-400">
              Set up your account to support your student athlete's NIL journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {successMessage && (
              <Alert className="mb-6 bg-green-900/30 border-green-700">
                <AlertCircle className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-green-300">{successMessage}</AlertDescription>
              </Alert>
            )}

            {consentToken && childInfo ? (
              // Consent flow - arrived via email link
              <form onSubmit={handleConsentSubmit} className="space-y-6">
                <Alert className="bg-blue-900/30 border-blue-700">
                  <Mail className="h-4 w-4 text-blue-400" />
                  <AlertDescription className="text-blue-300">
                    <strong>{childInfo.name}</strong> has requested your consent to use ChatNIL.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-white">Your Full Name</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Your full name"
                    required
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div className="p-4 bg-gray-700/50 rounded-lg space-y-2">
                  <p className="text-sm text-gray-300">By approving, you confirm that:</p>
                  <ul className="text-sm text-gray-400 list-disc list-inside space-y-1">
                    <li>You are the parent/guardian of {childInfo.name}</li>
                    <li>You consent to them using ChatNIL for NIL education</li>
                    <li>You will receive updates about their learning progress</li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Approving consent...
                    </>
                  ) : (
                    <>
                      Approve Consent
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              // Direct signup flow
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="direct">Link to Child</TabsTrigger>
                  <TabsTrigger value="invite">Invite Child</TabsTrigger>
                </TabsList>

                <TabsContent value="direct">
                  <form onSubmit={handleDirectSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-white">Your Full Name</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Your full name"
                        required
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="childEmail" className="text-white">Child's Email</Label>
                      <Input
                        id="childEmail"
                        type="email"
                        value={formData.childEmail}
                        onChange={(e) => setFormData({ ...formData, childEmail: e.target.value })}
                        placeholder="child@email.com"
                        required
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                      <p className="text-xs text-gray-400">
                        Enter your child's email to link your accounts
                      </p>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Setting up your profile...
                        </>
                      ) : (
                        <>
                          <LinkIcon className="h-4 w-4 mr-2" />
                          Link Accounts
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="invite">
                  <form onSubmit={handleDirectSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullNameInvite" className="text-white">Your Full Name</Label>
                      <Input
                        id="fullNameInvite"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Your full name"
                        required
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="childEmailInvite" className="text-white">Child's Email</Label>
                      <Input
                        id="childEmailInvite"
                        type="email"
                        value={formData.childEmail}
                        onChange={(e) => setFormData({ ...formData, childEmail: e.target.value })}
                        placeholder="child@email.com"
                        required
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                      <p className="text-xs text-gray-400">
                        We'll send an invite to your child to join ChatNIL
                      </p>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending invite...
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Invite
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
