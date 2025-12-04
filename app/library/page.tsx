import { AthleteOnlyGuard } from '@/components/guards/AthleteOnlyGuard';
import Library from '@/components/Library';

export default function LibraryPage() {
  return (
    <AthleteOnlyGuard>
      <Library />
    </AthleteOnlyGuard>
  );
}