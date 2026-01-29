'use client';

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  relationship: string;
  role: 'admin' | 'viewer';
  status: 'active' | 'pending';
}

interface FamilyAccessProps {
  members: FamilyMember[];
  onInvite: () => void;
}

export function FamilyAccess({ members, onInvite }: FamilyAccessProps) {
  const relationshipLabels: Record<string, string> = {
    mother: 'Mom',
    father: 'Dad',
    guardian: 'Guardian',
    stepparent: 'Step-parent',
    grandparent: 'Grandparent',
    other: 'Family'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <h3 className="font-bold flex items-center gap-2 mb-4">
        👨‍👩‍👦 Family Access
      </h3>

      <div className="space-y-3">
        {members.map(member => (
          <div key={member.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-bold">
                  {member.name.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-medium text-sm">{member.name}</p>
                <p className="text-xs text-gray-500">
                  {relationshipLabels[member.relationship] || member.relationship}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {member.status === 'pending' ? (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                  Pending
                </span>
              ) : (
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                  {member.role === 'admin' ? 'Admin' : 'Viewer'}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onInvite}
        className="w-full mt-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-purple-500 hover:text-purple-600 transition-colors flex items-center justify-center gap-2"
      >
        <span>➕</span>
        Invite Another Parent
      </button>

      <p className="text-xs text-gray-400 text-center mt-2">
        Invite a co-parent or guardian to view progress
      </p>
    </div>
  );
}

export default FamilyAccess;
