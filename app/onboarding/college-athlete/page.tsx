'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Loader2, AlertCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { US_STATES, SPORTS } from '@/lib/types/onboarding';

interface Institution {
  id: string;
  name: string;
  state: string;
}

export default function CollegeAthleteOnboardingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [institutionSearch, setInstitutionSearch] = useState('');
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [showInstitutionDropdown, setShowInstitutionDropdown] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    state: '',
    sport: '',
    institutionId: '',
    institutionName: '',
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
      const response = await fetch('/api/onboarding/college-athlete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete onboarding');
      }

      // Redirect to Discovery conversation
      router.push('/chat?discovery=true');
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
            <CardTitle className="text-2xl text-white">College Athlete Profile</CardTitle>
            <CardDescription className="text-gray-400">
              Set up your profile to manage NIL deals and track compliance
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
                <Label htmlFor="dateOfBirth" className="text-white">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  required
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state" className="text-white">State</Label>
                <select
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  required
                  className="w-full h-10 px-3 rounded-md bg-gray-700 border border-gray-600 text-white"
                >
                  <option value="">Select your state</option>
                  {US_STATES.map((state) => (
                    <option key={state.code} value={state.code}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sport" className="text-white">Primary Sport</Label>
                <select
                  id="sport"
                  value={formData.sport}
                  onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                  required
                  className="w-full h-10 px-3 rounded-md bg-gray-700 border border-gray-600 text-white"
                >
                  <option value="">Select your sport</option>
                  {SPORTS.map((sport) => (
                    <option key={sport} value={sport}>
                      {sport}
                    </option>
                  ))}
                </select>
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
                    placeholder="Search for your college/university"
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
                {!formData.institutionId && institutionSearch.length >= 2 && institutions.length === 0 && (
                  <p className="text-sm text-gray-400 mt-1">
                    Can't find your institution? Enter the name manually.
                  </p>
                )}
              </div>

              {/* Manual institution name if not found in search */}
              {!formData.institutionId && institutionSearch.length >= 2 && (
                <div className="space-y-2">
                  <Label htmlFor="manualInstitution" className="text-white">Institution Name (Manual Entry)</Label>
                  <Input
                    id="manualInstitution"
                    value={formData.institutionName}
                    onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                    placeholder="Enter your institution name"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Setting up your profile...
                  </>
                ) : (
                  <>
                    Continue to Discovery
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
