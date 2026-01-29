'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Loader2, AlertCircle, Search, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Alert, AlertDescription } from '@/components/ui/Alert';

interface Institution {
  id: string;
  name: string;
  state: string;
}

export default function ComplianceOfficerOnboardingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [institutionSearch, setInstitutionSearch] = useState('');
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [showInstitutionDropdown, setShowInstitutionDropdown] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    institutionId: '',
    institutionName: '',
    title: '',
    department: '',
    workEmail: '',
  });

  // Search institutions when search term changes
  useEffect(() => {
    const searchInstitutions = async () => {
      if (institutionSearch.length < 2) {
        setInstitutions([]);
        return;
      }

      try {
        const response = await fetch(`/api/institutions/search?q=${encodeURIComponent(institutionSearch)}`);
        if (response.ok) {
          const data = await response.json();
          setInstitutions(data.institutions || []);
        }
      } catch (err) {
        console.error('Error searching institutions:', err);
      }
    };

    const debounce = setTimeout(searchInstitutions, 300);
    return () => clearTimeout(debounce);
  }, [institutionSearch]);

  const selectInstitution = (institution: Institution) => {
    setFormData({
      ...formData,
      institutionId: institution.id,
      institutionName: institution.name,
    });
    setInstitutionSearch(institution.name);
    setShowInstitutionDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/onboarding/compliance-officer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete onboarding');
      }

      // Redirect to compliance dashboard
      router.push('/compliance/dashboard');
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
            <CardTitle className="text-2xl text-white">Compliance Officer Profile</CardTitle>
            <CardDescription className="text-gray-400">
              Set up your account to manage NIL compliance for your institution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-white">Full Name</Label>
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
                <Label htmlFor="workEmail" className="text-white">Work Email</Label>
                <Input
                  id="workEmail"
                  type="email"
                  value={formData.workEmail}
                  onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
                  placeholder="you@university.edu"
                  required
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <p className="text-xs text-gray-400">
                  Must be your institutional email for verification
                </p>
              </div>

              <div className="space-y-2 relative">
                <Label htmlFor="institution" className="text-white">Institution</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="institution"
                    value={institutionSearch}
                    onChange={(e) => {
                      setInstitutionSearch(e.target.value);
                      setShowInstitutionDropdown(true);
                      if (!e.target.value) {
                        setFormData({ ...formData, institutionId: '', institutionName: '' });
                      }
                    }}
                    onFocus={() => setShowInstitutionDropdown(true)}
                    placeholder="Search for your institution"
                    required
                    className="bg-gray-700 border-gray-600 text-white pl-10"
                  />
                </div>
                {showInstitutionDropdown && institutions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                    {institutions.map((institution) => (
                      <button
                        key={institution.id}
                        type="button"
                        onClick={() => selectInstitution(institution)}
                        className="w-full px-4 py-2 text-left text-white hover:bg-gray-600 transition-colors"
                      >
                        <div className="font-medium">{institution.name}</div>
                        <div className="text-sm text-gray-400">{institution.state}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Manual institution name if not found */}
              {!formData.institutionId && institutionSearch.length >= 2 && institutions.length === 0 && (
                <Alert className="bg-yellow-900/30 border-yellow-700">
                  <Building2 className="h-4 w-4 text-yellow-400" />
                  <AlertDescription className="text-yellow-300">
                    Institution not found. We'll create a new entry for your institution.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="title" className="text-white">Job Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., NIL Compliance Director"
                  required
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department" className="text-white">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g., Athletics Compliance"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <Alert className="bg-blue-900/30 border-blue-700">
                <AlertCircle className="h-4 w-4 text-blue-400" />
                <AlertDescription className="text-blue-300">
                  Your account will need to be verified before you can manage athletes. We'll review your information within 24-48 hours.
                </AlertDescription>
              </Alert>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Setting up your profile...
                  </>
                ) : (
                  <>
                    Request Verification
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
