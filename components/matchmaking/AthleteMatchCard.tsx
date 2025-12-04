'use client';

import { AgencyAthleteMatch } from '@/types';
import { useState } from 'react';
import { ChevronDown, ChevronUp, Mail, Eye, FileText } from 'lucide-react';
import { MatchToDealModal } from './MatchToDealModal';

interface AthleteMatchCardProps {
  match: AgencyAthleteMatch & { athlete?: any };
  onUpdate: () => void;
}

export function AthleteMatchCard({ match, onUpdate }: AthleteMatchCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showDealModal, setShowDealModal] = useState(false);

  const tierConfig = {
    excellent: {
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-300',
      textColor: 'text-purple-800',
      badgeBg: 'bg-purple-100',
      emoji: '🌟'
    },
    good: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300',
      textColor: 'text-green-800',
      badgeBg: 'bg-green-100',
      emoji: '✅'
    },
    potential: {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-300',
      textColor: 'text-yellow-800',
      badgeBg: 'bg-yellow-100',
      emoji: '💡'
    },
    poor: {
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-300',
      textColor: 'text-gray-800',
      badgeBg: 'bg-gray-100',
      emoji: '⚠️'
    }
  };

  const tier = ((match as any).match_tier || 'potential') as keyof typeof tierConfig;
  const config = tierConfig[tier];

  async function updateMatchStatus(newStatus: string) {
    setUpdating(true);
    try {
      const res = await fetch(`/api/matches/${match.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        onUpdate();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to update match');
      }
    } catch (error) {
      console.error('Error updating match:', error);
      alert('Failed to update match');
    } finally {
      setUpdating(false);
    }
  }

  const athlete = match.athlete;
  if (!athlete) return null;

  return (
    <div className={`rounded-xl shadow-sm border-2 ${config.borderColor} ${config.bgColor} p-6 hover:shadow-lg transition-shadow`}>
      {/* Match Score & Tier Badge */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-baseline gap-2">
            <div className="text-4xl font-bold">{match.match_score}</div>
            <div className="text-sm text-gray-600">/100</div>
          </div>
          <div className="text-xs text-gray-600 mt-1">Match Score</div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${config.badgeBg} ${config.textColor}`}>
          {config.emoji} {tier}
        </span>
      </div>

      {/* Athlete Info */}
      <div className="mb-4">
        <h3 className="font-bold text-lg mb-1">
          {athlete.first_name} {athlete.last_name}
        </h3>
        <p className="text-sm text-gray-600">
          {athlete.primary_sport} • {athlete.school_name}
        </p>
        {athlete.graduation_year && (
          <p className="text-xs text-gray-500 mt-1">
            Class of {athlete.graduation_year}
          </p>
        )}
      </div>

      {/* Social Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white bg-opacity-60 p-3 rounded-lg">
          <div className="font-bold text-lg">{(athlete.total_followers || 0).toLocaleString()}</div>
          <div className="text-xs text-gray-600">Followers</div>
        </div>
        <div className="bg-white bg-opacity-60 p-3 rounded-lg">
          <div className="font-bold text-lg">{(athlete.avg_engagement_rate || 0).toFixed(1)}%</div>
          <div className="text-xs text-gray-600">Engagement</div>
        </div>
      </div>

      {/* Match Reasons */}
      <div className="mb-4">
        <div className="text-xs font-semibold text-gray-700 mb-2">Why this match?</div>
        <div className="flex flex-wrap gap-1">
          {((match as any).match_reasons || []).slice(0, 3).map((reason: string, i: number) => (
            <span key={i} className="text-xs bg-white bg-opacity-60 px-2 py-1 rounded-md border border-gray-200">
              {reason}
            </span>
          ))}
          {(match as any).match_reasons && (match as any).match_reasons.length > 3 && (
            <span className="text-xs text-gray-500 px-2 py-1">
              +{(match as any).match_reasons.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Hobbies/Interests */}
      {athlete.hobbies && athlete.hobbies.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-semibold text-gray-700 mb-1">Interests</div>
          <div className="text-xs text-gray-600">
            {athlete.hobbies.slice(0, 3).join(', ')}
            {athlete.hobbies.length > 3 && ` +${athlete.hobbies.length - 3}`}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2">
        {/* Deal Created Badge */}
        {match.deal_id && (
          <div className="text-center text-sm text-teal-700 py-2 bg-teal-50 border border-teal-200 rounded-lg font-medium flex items-center justify-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Deal Created</span>
          </div>
        )}

        {match.status === 'suggested' && (
          <div className="flex gap-2">
            <button
              onClick={() => updateMatchStatus('saved')}
              disabled={updating}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Eye className="w-4 h-4" />
              <span>View Profile</span>
            </button>
            <button
              onClick={() => updateMatchStatus('contacted')}
              disabled={updating}
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-300 flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Mail className="w-4 h-4" />
              <span>Contact</span>
            </button>
          </div>
        )}

        {match.status === 'saved' && (
          <button
            onClick={() => updateMatchStatus('contacted')}
            disabled={updating}
            className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-300 flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Mail className="w-4 h-4" />
            <span>Contact Athlete</span>
          </button>
        )}

        {match.status === 'contacted' && (
          <div className="space-y-2">
            <div className="text-center text-sm text-gray-600 py-2 bg-white bg-opacity-60 rounded-lg">
              ✉️ Contact sent • {new Date(match.contacted_at || '').toLocaleDateString()}
            </div>
            {/* Propose Deal button for contacted status */}
            {!match.deal_id && (
              <button
                onClick={() => setShowDealModal(true)}
                disabled={updating}
                className="w-full px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:bg-gray-300 flex items-center justify-center gap-2 text-sm font-medium"
              >
                <FileText className="w-4 h-4" />
                <span>Propose Deal</span>
              </button>
            )}
          </div>
        )}

        {match.status === 'interested' && (
          <div className="space-y-2">
            <div className="text-center text-sm text-green-600 py-2 bg-green-100 rounded-lg font-medium">
              🎉 Athlete is interested!
            </div>
            {/* Propose Deal button for interested status */}
            {!match.deal_id && (
              <button
                onClick={() => setShowDealModal(true)}
                disabled={updating}
                className="w-full px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:bg-gray-300 flex items-center justify-center gap-2 text-sm font-medium"
              >
                <FileText className="w-4 h-4" />
                <span>Propose Deal</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Score Breakdown Toggle */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full mt-3 text-xs text-gray-600 hover:text-gray-900 flex items-center justify-center gap-1 py-2 hover:bg-white hover:bg-opacity-40 rounded-lg transition-colors"
      >
        <span>{showDetails ? 'Hide' : 'Show'} score breakdown</span>
        {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {/* Score Breakdown */}
      {showDetails && match.score_breakdown && (
        <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
          <div className="text-xs font-semibold text-gray-700 mb-2">Score Breakdown</div>
          {Object.entries(match.score_breakdown).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between text-xs">
              <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      value >= 8 ? 'bg-green-500' : value >= 5 ? 'bg-yellow-500' : 'bg-gray-400'
                    }`}
                    style={{ width: `${(value / 20) * 100}%` }}
                  />
                </div>
                <span className="font-semibold w-8 text-right">{value}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Match to Deal Modal */}
      {showDealModal && (
        <MatchToDealModal
          match={{
            id: match.id,
            athlete_id: match.athlete_id,
            agency_id: match.agency_id,
            match_score: match.match_score,
            athlete: match.athlete
          }}
          onClose={() => setShowDealModal(false)}
          onSuccess={() => {
            setShowDealModal(false);
            onUpdate();
          }}
        />
      )}
    </div>
  );
}
