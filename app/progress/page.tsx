import { AthleteOnlyGuard } from '@/components/guards/AthleteOnlyGuard';
import ProgressPage from '@/components/progress/ProgressPage';

export default function Progress() {
  return (
    <AthleteOnlyGuard>
      <ProgressPage />
    </AthleteOnlyGuard>
  );
}
