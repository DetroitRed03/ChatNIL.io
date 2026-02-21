'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  ComplianceTeamMember,
  ComplianceTeamInvite,
  ComplianceTeamRole,
  rolePermissionDefaults,
} from '@/types/settings';
import {
  ArrowLeft,
  Users,
  UserPlus,
  Mail,
  Trash2,
  X,
  Loader2,
  Shield,
  Eye,
  CheckCircle,
  AlertCircle,
  Clock,
  Copy,
  BarChart3,
  Settings,
} from 'lucide-react';

interface TeamMemberWithWorkload extends ComplianceTeamMember {
  openItems?: number;
  completedThisWeek?: number;
  overdueItems?: number;
}

export default function ComplianceTeamPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<TeamMemberWithWorkload[]>([]);
  const [invites, setInvites] = useState<ComplianceTeamInvite[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    name: '',
    role: 'officer' as ComplianceTeamRole,
  });
  const [inviting, setInviting] = useState(false);

  // Member detail state
  const [selectedMember, setSelectedMember] = useState<TeamMemberWithWorkload | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const getAccessToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  };

  const fetchTeamData = useCallback(async () => {
    try {
      setLoading(true);
      const accessToken = await getAccessToken();
      const headers: HeadersInit = accessToken
        ? { 'Authorization': `Bearer ${accessToken}` }
        : {};

      const [membersRes, workloadRes] = await Promise.all([
        fetch('/api/compliance/team/members', { credentials: 'include', headers }),
        fetch('/api/compliance/team', { credentials: 'include', headers }),
      ]);

      if (membersRes.ok) {
        const membersData = await membersRes.json();
        const membersList = membersData.members || [];
        const invitesList = membersData.invites || [];

        // Merge workload data if available
        if (workloadRes.ok) {
          const workloadData = await workloadRes.json();
          const workloadMap = new Map(
            (workloadData.members || []).map((m: any) => [m.id, m])
          );

          const enriched = membersList.map((member: ComplianceTeamMember) => {
            const wl = workloadMap.get(member.user_id) as any;
            return {
              ...member,
              openItems: wl?.openItems || 0,
              completedThisWeek: wl?.completedThisWeek || 0,
              overdueItems: wl?.overdueItems || 0,
            };
          });
          setMembers(enriched);
        } else {
          setMembers(membersList);
        }

        setInvites(invitesList);
      } else {
        setError('Failed to load team data');
      }
    } catch (err) {
      console.error('Error fetching team:', err);
      setError('Failed to load team data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      fetchTeamData();
    }
  }, [authLoading, user, fetchTeamData]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.email) return;

    setInviting(true);
    setError(null);
    try {
      const accessToken = await getAccessToken();
      const res = await fetch('/api/compliance/team/invite', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          email: inviteForm.email,
          name: inviteForm.name,
          role: inviteForm.role,
          permissions: rolePermissionDefaults[inviteForm.role],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to send invite');
        return;
      }

      setSuccessMsg(`Invite sent to ${inviteForm.email}`);
      setShowInviteModal(false);
      setInviteForm({ email: '', name: '', role: 'officer' });
      fetchTeamData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setError('Failed to send invite');
    } finally {
      setInviting(false);
    }
  };

  const removeMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;

    setRemovingId(memberId);
    try {
      const accessToken = await getAccessToken();
      const res = await fetch(`/api/compliance/team/members?id=${memberId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {},
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to remove member');
        return;
      }

      setSuccessMsg('Team member removed');
      setSelectedMember(null);
      fetchTeamData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setError('Failed to remove member');
    } finally {
      setRemovingId(null);
    }
  };

  const cancelInvite = async (inviteId: string) => {
    if (!confirm('Cancel this invite?')) return;

    setCancellingId(inviteId);
    try {
      const accessToken = await getAccessToken();
      const res = await fetch(`/api/compliance/team/invite?id=${inviteId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {},
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to cancel invite');
        return;
      }

      setSuccessMsg('Invite cancelled');
      fetchTeamData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setError('Failed to cancel invite');
    } finally {
      setCancellingId(null);
    }
  };

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}/compliance/join?token=${token}`;
    navigator.clipboard.writeText(link);
    setSuccessMsg('Invite link copied to clipboard');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      admin: 'bg-purple-100 text-purple-700',
      lead: 'bg-blue-100 text-blue-700',
      officer: 'bg-orange-100 text-orange-700',
      assistant: 'bg-green-100 text-green-700',
      viewer: 'bg-gray-100 text-gray-600',
    };
    return styles[role] || styles.viewer;
  };

  const getPermissionsList = (member: ComplianceTeamMember) => {
    const perms = [];
    if (member.can_approve_deals) perms.push('Approve deals');
    if (member.can_reject_deals) perms.push('Reject deals');
    if (member.can_flag_deals) perms.push('Flag deals');
    if (member.can_invite_members) perms.push('Invite members');
    if (member.can_manage_members) perms.push('Manage team');
    if (member.can_access_reports) perms.push('Reports');
    if (member.can_export_data) perms.push('Export data');
    return perms;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/compliance')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Team Management</h1>
              <p className="text-sm text-gray-500">
                {members.length} member{members.length !== 1 ? 's' : ''}
                {invites.length > 0 && ` · ${invites.length} pending invite${invites.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/compliance/settings')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium"
            >
              <UserPlus className="w-4 h-4" />
              Invite Member
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Alerts */}
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-red-100 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm">{successMsg}</p>
          </div>
        )}

        {/* Team Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Active Members</p>
            <p className="text-2xl font-bold text-gray-900">{members.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Pending Invites</p>
            <p className="text-2xl font-bold text-yellow-600">{invites.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total Open Items</p>
            <p className="text-2xl font-bold text-orange-600">
              {members.reduce((sum, m) => sum + (m.openItems || 0), 0)}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Overdue Items</p>
            <p className="text-2xl font-bold text-red-600">
              {members.reduce((sum, m) => sum + (m.overdueItems || 0), 0)}
            </p>
          </div>
        </div>

        {/* Team Members */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Team Members</h2>
          </div>

          {members.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No team members yet</h3>
              <p className="text-sm text-gray-500 mb-4">Invite colleagues to help manage compliance</p>
              <button
                onClick={() => setShowInviteModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
              >
                <UserPlus className="w-4 h-4" />
                Invite First Member
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {members.map(member => {
                const isCurrentUser = member.user_id === user?.id;
                const permissions = getPermissionsList(member);

                return (
                  <div
                    key={member.id}
                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedMember(selectedMember?.id === member.id ? null : member)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-medium">
                          {member.user?.full_name?.[0] || member.user?.email?.[0] || '?'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">
                              {member.user?.full_name || 'Unknown'}
                              {isCurrentUser && (
                                <span className="ml-2 text-xs text-gray-400">(You)</span>
                              )}
                            </p>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getRoleBadge(member.role)}`}>
                              {member.role}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">{member.user?.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Workload indicators */}
                        <div className="hidden sm:flex items-center gap-3 text-sm">
                          <span className="text-gray-500">
                            {member.openItems || 0} open
                          </span>
                          {(member.overdueItems || 0) > 0 && (
                            <span className="text-red-600 font-medium">
                              {member.overdueItems} overdue
                            </span>
                          )}
                          <span className="text-gray-400">
                            {member.completedThisWeek || 0} this week
                          </span>
                        </div>

                        {!isCurrentUser && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeMember(member.id);
                            }}
                            disabled={removingId === member.id}
                            className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 disabled:opacity-50"
                            title="Remove member"
                          >
                            {removingId === member.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expanded Detail */}
                    {selectedMember?.id === member.id && (
                      <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase mb-2">Permissions</p>
                          {permissions.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {permissions.map(p => (
                                <span key={p} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                  {p}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-400">View only</p>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase mb-2">Sports Access</p>
                          <p className="text-sm text-gray-700">
                            {member.all_sports_access ? 'All sports' : (
                              member.sports_access?.join(', ') || 'None specified'
                            )}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            Joined {new Date(member.joined_at || member.created_at).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pending Invites */}
        {invites.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Pending Invites</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {invites.map(invite => (
                <div key={invite.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {invite.invitee_name || invite.invitee_email}
                      </p>
                      <p className="text-sm text-gray-500">{invite.invitee_email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getRoleBadge(invite.role)}`}>
                      {invite.role}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded-full">
                      <Clock className="w-3 h-3" />
                      Pending
                    </span>
                    <button
                      onClick={() => copyInviteLink(invite.invite_token)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                      title="Copy invite link"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => cancelInvite(invite.id)}
                      disabled={cancellingId === invite.id}
                      className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 disabled:opacity-50"
                      title="Cancel invite"
                    >
                      {cancellingId === invite.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Invite Team Member</h2>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={inviteForm.email}
                  onChange={e => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="colleague@school.edu"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (optional)
                </label>
                <input
                  type="text"
                  value={inviteForm.name}
                  onChange={e => setInviteForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="John Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={inviteForm.role}
                  onChange={e => setInviteForm(prev => ({ ...prev, role: e.target.value as ComplianceTeamRole }))}
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="admin">Admin - Full access</option>
                  <option value="officer">Officer - Can approve/reject deals</option>
                  <option value="assistant">Assistant - Can flag but not approve</option>
                  <option value="viewer">Viewer - Read-only access</option>
                </select>
              </div>

              {/* Role permissions preview */}
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs font-medium text-gray-500 mb-2">Permissions for {inviteForm.role}:</p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(rolePermissionDefaults[inviteForm.role] || {})
                    .filter(([, val]) => val === true)
                    .map(([key]) => (
                      <span key={key} className="px-2 py-0.5 bg-white border border-gray-200 text-gray-600 text-xs rounded-full">
                        {key.replace('can_', '').replace(/_/g, ' ')}
                      </span>
                    ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting || !inviteForm.email}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {inviting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Send Invite
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
