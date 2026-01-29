'use client';

import { useParams } from 'next/navigation';
import { AthleteDetailPage } from '@/components/compliance-dashboard';

export default function ComplianceAthleteDetailPage() {
  const params = useParams();
  const id = params.id as string;
  return <AthleteDetailPage athleteId={id} />;
}
