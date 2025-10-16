'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/AuthGuard';
import { supabase } from '@/lib/supabase';
import AppShell from '@/components/Chat/AppShell';
import Header from '@/components/Header';
import ProfileImageUpload from '@/components/ProfileImageUpload';
import SportAutocomplete from '@/components/SportAutocomplete';
import SchoolAutocomplete from '@/components/SchoolAutocomplete';
import NILInterestsSelect from '@/components/NILInterestsSelect';
import AchievementsInput from '@/components/AchievementsInput';
import NILGoalsInput from '@/components/NILGoalsInput';
import SocialMediaInput from '@/components/SocialMediaInput';
import BadgeShowcase from '@/components/badges/BadgeShowcase';
import {
  User,
  School,
  Trophy,
  Target,
  Edit3,
  Save,
  X,
  ChevronRight,
  Home,
  AlertCircle,
  CheckCircle,
  Star,
  TrendingUp,
  Zap,
  RefreshCw,
  Info
} from 'lucide-react';

interface ProfileSection {
  id: string;
  title: string;
  icon: any;
  fields: Array<{
    key: string;
    label: string;
    value: any;
    type: 'text' | 'email' | 'date' | 'number' | 'select' | 'textarea' | 'array' | 'sport-autocomplete' | 'position' | 'school-autocomplete' | 'nil-interests' | 'achievements' | 'nil-goals' | 'nil-concerns' | 'social-media';
    options?: string[];
  }>;
}

function ProfilePageContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  useEffect(() => {
    // Since we're in a ProtectedRoute, user should always exist here
    // But we still need to handle the case where user data is still loading
    if (!user) {
      console.log('⚠️ User is null in ProtectedRoute - waiting for AuthGuard...');
      return;
    }

    console.log('✅ Profile page: User authenticated, loading profile data...');

    if (user.profile) {
      // Profile data is already available from AuthContext
      setProfile(user.profile);
      setLoading(false);
      console.log('✅ Profile data loaded from AuthContext');
    } else {
      // If user exists but profile is missing, try direct fetch
      const fetchProfileDirectly = async () => {
        try {
          console.log('📞 Fetching profile directly from database...');
          const { data: profile, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('❌ Profile fetch error:', error);
            setError(`Failed to load profile: ${error.message}`);
            setLoading(false);
            return;
          }

          if (profile) {
            console.log('✅ Profile fetched successfully');
            setProfile(profile);
            setLoading(false);
          } else {
            console.log('⚠️ No profile found in database');
            setError('No profile found. Please complete onboarding to create your profile.');
            setLoading(false);
          }
        } catch (error) {
          console.error('💥 Error in profile fetch:', error);
          setError('An unexpected error occurred while loading your profile');
          setLoading(false);
        }
      };

      fetchProfileDirectly();
    }
  }, [user]);

  // Add timeout effect to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading && !profile) {
        console.log('⏰ Loading timeout reached (10 seconds)');
        setLoadingTimeout(true);
        setError('Profile loading is taking longer than expected. Please refresh the page or try again.');
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [loading, profile]);

  const calculateCompletion = () => {
    if (!profile) return { percentage: 0, completed: 0, total: 15 };

    const fieldChecks = [
      { field: 'first_name', value: profile.first_name, priority: 'high' },
      { field: 'last_name', value: profile.last_name, priority: 'high' },
      { field: 'email', value: profile.email, priority: 'high' },
      { field: 'date_of_birth', value: profile.date_of_birth, priority: 'medium' },
      { field: 'phone', value: profile.phone, priority: 'high' },
      { field: 'school_name', value: profile.school_name, priority: 'high' },
      { field: 'graduation_year', value: profile.graduation_year, priority: 'high' },
      { field: 'major', value: profile.major, priority: 'medium' },
      { field: 'gpa', value: profile.gpa, priority: 'medium' },
      { field: 'primary_sport', value: profile.primary_sport, priority: 'high' },
      { field: 'position', value: profile.position, priority: 'high' },
      { field: 'achievements', value: profile.achievements && profile.achievements.length > 0, priority: 'high' },
      { field: 'nil_interests', value: profile.nil_interests && profile.nil_interests.length > 0, priority: 'high' },
      { field: 'nil_concerns', value: profile.nil_concerns && profile.nil_concerns.length > 0, priority: 'medium' },
      { field: 'social_media_handles', value: profile.social_media_handles, priority: 'high' }
    ];

    const totalFields = fieldChecks.length;
    const completedFields = fieldChecks.filter(check => check.value).length;
    const percentage = Math.round((completedFields / totalFields) * 100);

    return { percentage, completed: completedFields, total: totalFields, fieldChecks };
  };

  const getMissingFields = () => {
    if (!profile) return [];

    const fieldInfo = {
      first_name: { label: 'First Name', nilImportance: 'Required for brand partnerships and contracts', priority: 'high' },
      last_name: { label: 'Last Name', nilImportance: 'Required for brand partnerships and contracts', priority: 'high' },
      email: { label: 'Email', nilImportance: 'Primary contact for NIL opportunities', priority: 'high' },
      date_of_birth: { label: 'Date of Birth', nilImportance: 'Age verification for certain sponsorships', priority: 'medium' },
      phone: { label: 'Phone Number', nilImportance: 'Direct contact for urgent opportunities', priority: 'high' },
      school_name: { label: 'School Name', nilImportance: 'Local brand partnerships and compliance requirements', priority: 'high' },
      graduation_year: { label: 'Graduation Year', nilImportance: 'Eligibility timeline for opportunities', priority: 'high' },
      major: { label: 'Major', nilImportance: 'Academic-focused sponsorships and tutoring deals', priority: 'medium' },
      gpa: { label: 'GPA', nilImportance: 'Academic performance bonuses and scholarships', priority: 'medium' },
      primary_sport: { label: 'Primary Sport', nilImportance: 'Sport-specific brand partnerships and equipment deals', priority: 'high' },
      position: { label: 'Position', nilImportance: 'Position-specific endorsements and coaching opportunities', priority: 'high' },
      achievements: { label: 'Achievements', nilImportance: 'Showcase accomplishments for higher-value deals', priority: 'high' },
      nil_interests: { label: 'NIL Interests', nilImportance: 'Match with relevant brand categories and opportunities', priority: 'high' },
      nil_concerns: { label: 'NIL Concerns', nilImportance: 'Avoid conflicts and ensure comfortable partnerships', priority: 'medium' },
      social_media_handles: { label: 'Social Media', nilImportance: 'Essential for social media sponsorships and follower verification', priority: 'high' }
    };

    const missing: any[] = [];
    Object.entries(fieldInfo).forEach(([key, info]) => {
      const value = profile[key as keyof typeof profile];
      const isEmpty = !value || (Array.isArray(value) && value.length === 0);

      if (isEmpty) {
        missing.push({
          key,
          ...info
        });
      }
    });

    // Sort by priority: high first, then medium
    return missing.sort((a, b) => {
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (b.priority === 'high' && a.priority !== 'high') return 1;
      return 0;
    });
  };

  const profileSections: ProfileSection[] = [
    {
      id: 'personal',
      title: 'Personal Information',
      icon: User,
      fields: [
        { key: 'first_name', label: 'First Name', value: profile?.first_name, type: 'text' },
        { key: 'last_name', label: 'Last Name', value: profile?.last_name, type: 'text' },
        { key: 'email', label: 'Email', value: profile?.email, type: 'email' },
        { key: 'date_of_birth', label: 'Date of Birth', value: profile?.date_of_birth, type: 'date' },
        { key: 'phone', label: 'Phone', value: profile?.phone, type: 'text' },
        { key: 'parent_email', label: 'Parent Email', value: profile?.parent_email, type: 'email' },
        { key: 'bio', label: 'Bio', value: profile?.bio, type: 'textarea' },
      ]
    },
    {
      id: 'school',
      title: 'School Information',
      icon: School,
      fields: [
        { key: 'school_name', label: 'School Name', value: profile?.school_name, type: 'school-autocomplete' },
        { key: 'school_level', label: 'School Level', value: profile?.school_level, type: 'select', options: ['high_school', 'college_freshman', 'college_sophomore', 'college_junior', 'college_senior', 'graduate'] },
        { key: 'graduation_year', label: 'Graduation Year', value: profile?.graduation_year, type: 'number' },
        { key: 'major', label: 'Major', value: profile?.major, type: 'text' },
        { key: 'gpa', label: 'GPA', value: profile?.gpa, type: 'number' },
      ]
    },
    {
      id: 'athletic',
      title: 'Athletic Information',
      icon: Trophy,
      fields: [
        { key: 'primary_sport', label: 'Primary Sport', value: profile?.primary_sport, type: 'sport-autocomplete' },
        { key: 'position', label: 'Position', value: profile?.position, type: 'position' }, // Handled by sport-autocomplete
        { key: 'secondary_sports', label: 'Other Sports', value: profile?.secondary_sports, type: 'array' },
        { key: 'achievements', label: 'Achievements', value: profile?.achievements, type: 'achievements' },
        { key: 'coach_name', label: 'Coach Name', value: profile?.coach_name, type: 'text' },
        { key: 'coach_email', label: 'Coach Email', value: profile?.coach_email, type: 'email' },
      ]
    },
    {
      id: 'nil',
      title: 'NIL Information',
      icon: Target,
      fields: [
        { key: 'nil_interests', label: 'NIL Interests', value: profile?.nil_interests, type: 'nil-interests' },
        { key: 'nil_goals', label: 'NIL Goals', value: profile?.nil_goals, type: 'nil-goals' },
        { key: 'nil_concerns', label: 'NIL Concerns', value: profile?.nil_concerns, type: 'nil-concerns' },
        { key: 'social_media_handles', label: 'Social Media', value: profile?.social_media_handles, type: 'social-media' },
      ]
    }
  ];

  const handleEdit = (sectionId: string) => {
    setEditingSection(sectionId);
    const section = profileSections.find(s => s.id === sectionId);
    if (section) {
      const data: any = {};
      section.fields.forEach(field => {
        // Initialize fields based on type to avoid PostgreSQL errors
        if (field.type === 'date') {
          // Use null for empty date fields
          data[field.key] = field.value || null;
        } else if (field.type === 'array' || field.type === 'nil-interests' || field.type === 'achievements' || field.type === 'nil-goals' || field.type === 'nil-concerns') {
          // Use empty array for array-based fields
          data[field.key] = field.value || [];
        } else {
          // Use empty string for text fields
          data[field.key] = field.value || '';
        }
      });
      setEditData(data);
    }
  };

  const handleSave = async (sectionId: string) => {
    setSaving(true);
    console.log('💾 Saving profile data:', editData);

    try {
      // Get the current section to check field types
      const section = profileSections.find(s => s.id === sectionId);
      const fieldTypesMap: Record<string, string> = {};
      section?.fields.forEach(field => {
        fieldTypesMap[field.key] = field.type;
      });

      // Sanitize data before sending to API
      const sanitizedData: any = {};
      Object.keys(editData).forEach(key => {
        const value = editData[key];
        const fieldType = fieldTypesMap[key];

        // Convert empty strings to null for date fields to avoid PostgreSQL error
        if (value === '' && (key.includes('date') || fieldType === 'date')) {
          sanitizedData[key] = null;
        }
        // Convert empty strings to empty arrays for array-type fields
        else if (value === '' && (fieldType === 'array' || fieldType === 'nil-interests' || fieldType === 'achievements' || fieldType === 'nil-goals' || fieldType === 'nil-concerns')) {
          sanitizedData[key] = [];
        }
        // Keep the value as-is
        else {
          sanitizedData[key] = value;
        }
      });

      console.log('💾 Sanitized data:', sanitizedData);

      // Call API to update profile using service role
      const response = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          updates: sanitizedData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.details
          ? `Failed to update profile: ${data.details}`
          : data.error || 'Failed to update profile';
        throw new Error(errorMessage);
      }

      console.log('✅ Profile updated successfully:', data);

      // Update local profile state
      setProfile({ ...profile, ...editData });
      setEditingSection(null);
      setEditData({});

      // Show success message
      alert('✅ Profile updated successfully!');
    } catch (error: any) {
      console.error('❌ Failed to update profile:', error);
      alert(`❌ Failed to save changes: ${error.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingSection(null);
    setEditData({});
  };

  const renderFieldValue = (field: any) => {
    if (!field.value) {
      return <span className="text-gray-400 italic">Not provided</span>;
    }

    switch (field.type) {
      case 'array':
        if (Array.isArray(field.value)) {
          return field.value.length > 0
            ? field.value.join(', ')
            : <span className="text-gray-400 italic">None added</span>;
        }
        return <span className="text-gray-400 italic">None added</span>;

      case 'textarea':
        return typeof field.value === 'string'
          ? field.value
          : JSON.stringify(field.value, null, 2);

      case 'date':
        return field.value ? new Date(field.value).toLocaleDateString() : 'Not provided';

      case 'social-media':
        if (typeof field.value === 'object' && field.value !== null) {
          const handles = Object.entries(field.value)
            .filter(([_, value]) => value) // Only show platforms with values
            .map(([platform, handle]) => `${platform}: @${handle}`)
            .join(', ');
          return handles || <span className="text-gray-400 italic">No social media added</span>;
        }
        return <span className="text-gray-400 italic">No social media added</span>;

      default:
        return field.value;
    }
  };

  const renderEditField = (field: any, sectionFields: any[]) => {
    // Get value with appropriate default based on field type
    let value = editData[field.key];

    if (value === undefined || value === null) {
      if (['array', 'nil-interests', 'achievements', 'nil-goals', 'nil-concerns'].includes(field.type)) {
        value = [];
      } else if (field.type === 'social-media') {
        value = {};
      } else {
        value = '';
      }
    }

    const baseInputClasses = "w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white shadow-sm transition-all duration-200 hover:border-orange-300 font-medium";

    // Skip position field - it's handled by sport-autocomplete
    if (field.type === 'position') {
      return null;
    }

    switch (field.type) {
      case 'sport-autocomplete': {
        // Find the position field to get its value
        const positionField = sectionFields.find(f => f.key === 'position');
        return (
          <SportAutocomplete
            sportValue={editData['primary_sport'] || ''}
            positionValue={editData['position'] || ''}
            onSportChange={(sport) => setEditData({...editData, primary_sport: sport})}
            onPositionChange={(position) => setEditData({...editData, position: position})}
          />
        );
      }
      case 'school-autocomplete':
        return (
          <SchoolAutocomplete
            value={editData[field.key] || ''}
            onChange={(value) => setEditData({...editData, [field.key]: value})}
            placeholder="Search for your school..."
            includeLevel={true}
          />
        );
      case 'nil-interests':
        return (
          <NILInterestsSelect
            value={editData[field.key] || []}
            onChange={(value) => setEditData({...editData, [field.key]: value})}
          />
        );
      case 'achievements':
        return (
          <AchievementsInput
            value={editData[field.key] || []}
            onChange={(value) => setEditData({...editData, [field.key]: value})}
            placeholder="Add an achievement..."
          />
        );
      case 'nil-goals':
        return (
          <NILGoalsInput
            value={editData[field.key] || []}
            onChange={(value) => setEditData({...editData, [field.key]: value})}
            placeholder="Add a NIL goal..."
          />
        );
      case 'nil-concerns':
        return (
          <NILGoalsInput
            value={editData[field.key] || []}
            onChange={(value) => setEditData({...editData, [field.key]: value})}
            placeholder="Add a NIL concern..."
          />
        );
      case 'social-media':
        return (
          <SocialMediaInput
            value={editData[field.key] || {}}
            onChange={(value) => setEditData({...editData, [field.key]: value})}
          />
        );
      case 'textarea':
        return (
          <textarea
            value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
            onChange={(e) => setEditData({...editData, [field.key]: e.target.value})}
            className={`${baseInputClasses} resize-none`}
            rows={4}
            placeholder={`Enter your ${field.label.toLowerCase()}...`}
          />
        );

      case 'array':
        return (
          <input
            type="text"
            value={Array.isArray(value) ? value.join(', ') : value}
            onChange={(e) => setEditData({...editData, [field.key]: e.target.value.split(', ').filter(Boolean)})}
            className={baseInputClasses}
            placeholder="Enter items separated by commas"
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => setEditData({...editData, [field.key]: parseFloat(e.target.value) || ''})}
            className={baseInputClasses}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => setEditData({...editData, [field.key]: e.target.value})}
            className={baseInputClasses}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        );

      default:
        return (
          <input
            type={field.type}
            value={value}
            onChange={(e) => setEditData({...editData, [field.key]: e.target.value})}
            className={baseInputClasses}
            placeholder={`Enter your ${field.label.toLowerCase()}...`}
          />
        );
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {loadingTimeout ? 'Still loading...' : 'Loading profile...'}
          </p>
          {loadingTimeout && (
            <p className="mt-2 text-sm text-gray-500">
              This is taking longer than usual. Please be patient or refresh the page.
            </p>
          )}
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Profile Loading Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                setLoadingTimeout(false);
                window.location.reload();
              }}
              className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Refresh Page
            </button>
            {error.includes('onboarding') && (
              <button
                onClick={() => window.location.href = '/onboarding'}
                className="w-full px-4 py-2 border border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
              >
                Complete Onboarding
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show "no profile" state (shouldn't normally happen if error handling works correctly)
  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No Profile Found</h2>
          <p className="text-gray-600 mb-4">We couldn't find your profile information.</p>
          <button
            onClick={() => window.location.href = '/onboarding'}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Complete Onboarding
          </button>
        </div>
      </div>
    );
  }

  const completionData = calculateCompletion();
  const missingFields = getMissingFields();

  // Main profile render
  return (
    <AppShell>
      <Header />
      <div className="min-h-full overflow-y-auto bg-gradient-to-br from-orange-50 via-white to-purple-50 py-6 px-4 sm:p-6 pb-12">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 mb-8 overflow-hidden">
        {/* Background Pattern */}
        <div className="h-24 bg-gradient-to-r from-orange-400 via-orange-500 to-purple-500 relative">
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="px-6 pb-6 -mt-12 relative">
          <div className="flex items-end justify-between">
            <div className="flex items-end space-x-4">
              <div className="relative">
                <ProfileImageUpload
                  currentImageUrl={profile?.profile_image_url}
                  onImageUpdate={(imageUrl) => {
                    setProfile({ ...profile, profile_image_url: imageUrl });
                  }}
                  size="large"
                />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-2xl">
                    {profile?.role === 'athlete' ? '🏆' : profile?.role === 'coach' ? '👨‍🏫' : '👨‍👩‍👧‍👦'}
                  </span>
                </div>
              </div>
              <div className="pb-2">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">{user?.name}</h1>
                <p className="text-gray-600 capitalize font-medium">{profile?.role} Profile</p>
                <p className="text-sm text-gray-500 mt-1 flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  Click avatar to upload photo
                </p>
              </div>
            </div>

            {/* Completion Badge */}
            <div className="text-right pb-2">
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-lg ${
                completionData.percentage >= 80
                  ? 'bg-gradient-to-r from-green-400 to-green-500 text-white'
                  : completionData.percentage >= 50
                  ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white'
                  : 'bg-gradient-to-r from-red-400 to-red-500 text-white'
              }`}>
                {completionData.percentage >= 80 && <CheckCircle className="h-4 w-4 mr-2" />}
                {completionData.percentage < 80 && <AlertCircle className="h-4 w-4 mr-2" />}
                {completionData.percentage}% Complete
              </div>
              <p className="text-sm text-gray-600 mt-2 font-medium">
                {completionData.completed}/{completionData.total} fields completed
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div>
        {/* Profile Completion Guidance */}
        {completionData.percentage < 100 && (
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl border border-orange-200 p-6 mb-8">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-semibold text-orange-900 mb-2">
                  Complete Your Profile for Maximum NIL Opportunities
                </h3>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-orange-800">
                      Progress: {completionData.completed}/{completionData.total} fields
                    </span>
                    <span className="text-sm font-medium text-orange-800">
                      {completionData.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-white rounded-full h-3 border border-orange-200">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        completionData.percentage >= 80
                          ? 'bg-green-500'
                          : completionData.percentage >= 50
                          ? 'bg-orange-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${completionData.percentage}%` }}
                    ></div>
                  </div>
                </div>

                <p className="text-orange-700 text-sm mb-4">
                  A complete profile increases your chances of being matched with relevant NIL opportunities by up to 3x.
                </p>

                {/* Missing Fields */}
                {missingFields.length > 0 && (
                  <div>
                    <h4 className="font-medium text-orange-900 mb-3 flex items-center">
                      <Star className="h-4 w-4 mr-2" />
                      Missing Fields ({missingFields.length})
                    </h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {missingFields.slice(0, 6).map((field) => (
                        <div
                          key={field.key}
                          className="bg-white rounded-lg p-3 border border-orange-200 hover:border-orange-300 transition-colors"
                        >
                          <div className="flex items-center mb-2">
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              field.priority === 'high' ? 'bg-red-500' : 'bg-orange-400'
                            }`}></div>
                            <span className="font-medium text-gray-900 text-sm">
                              {field.label}
                            </span>
                            {field.priority === 'high' && (
                              <Zap className="h-3 w-3 text-red-500 ml-1" />
                            )}
                          </div>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            {field.nilImportance}
                          </p>
                        </div>
                      ))}
                    </div>
                    {missingFields.length > 6 && (
                      <p className="text-sm text-orange-700 mt-3">
                        +{missingFields.length - 6} more fields to complete for maximum NIL potential
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Success Message for Complete Profile */}
        {completionData.percentage === 100 && (
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl border border-green-200 p-6 mb-8">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  🎉 Profile Complete! You're Ready for NIL Success
                </h3>
                <p className="text-green-700 text-sm">
                  Your complete profile maximizes your visibility to brands and NIL opportunities.
                  Keep your information updated as your athletic career progresses.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Badge Showcase Section */}
        {user && (
          <div className="mb-8">
            <BadgeShowcase userId={user.id} />
          </div>
        )}

        {/* Journey Management Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <RefreshCw className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Your Journey</h2>
                  <p className="text-purple-100 text-sm">Current role and onboarding status</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="text-5xl">
                  {profile?.role === 'athlete' ? '🏆' : profile?.role === 'coach' ? '👨‍🏫' : '👨‍👩‍👧‍👦'}
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Current Role</div>
                  <div className="text-2xl font-bold text-gray-900 capitalize">{profile?.role}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Joined {new Date(profile?.created_at || '').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </div>

              <button
                onClick={() => window.location.href = '/settings'}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Change Role
              </button>
            </div>

            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-purple-900 mb-1">Want to switch your journey?</h4>
                  <p className="text-sm text-purple-700 leading-relaxed">
                    You can change your role at any time in Settings. Changing your role will restart the onboarding process
                    to help you set up your new profile correctly. Your account data will be preserved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {profileSections.map((section, index) => {
            const Icon = section.icon;
            const isEditing = editingSection === section.id;

            return (
              <div
                key={section.id}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-2xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                  </div>

                  {!isEditing ? (
                    <button
                      onClick={() => handleEdit(section.id)}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </button>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleSave(section.id)}
                        disabled={saving}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={saving}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium bg-white text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-800 transition-all duration-200 shadow-sm"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                <div className="px-6 py-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {section.fields.map((field) => {
                      // Skip position field rendering - it's handled by sport-autocomplete
                      if (isEditing && field.type === 'position') {
                        return null;
                      }

                      return (
                        <div key={field.key} className={`group ${field.type === 'sport-autocomplete' ? 'md:col-span-2' : ''}`}>
                          {/* Only show label for non-sport-autocomplete fields in edit mode */}
                          {(!isEditing || field.type !== 'sport-autocomplete') && (
                            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                              <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                              {field.label}
                            </label>
                          )}
                          {isEditing ? (
                            <div className="relative">
                              {renderEditField(field, section.fields)}
                            </div>
                          ) : (
                          <div className="bg-gray-50 rounded-xl p-4 min-h-[3rem] flex items-center text-gray-900 font-medium border border-gray-200 group-hover:bg-orange-50 group-hover:border-orange-200 transition-all duration-200">
                            {renderFieldValue(field)}
                          </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      </div>
    </AppShell>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfilePageContent />
    </ProtectedRoute>
  );
}