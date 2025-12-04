import Link from 'next/link';
import { Search, Home } from 'lucide-react';
import { NeumorphicButton } from '@/components/ui';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center">
            <Search className="w-12 h-12 text-primary-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Athlete Not Found
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            We couldn't find an athlete profile with this username.
          </p>
          <p className="text-sm text-gray-500">
            The profile may have been removed, or the username might be incorrect.
          </p>
        </div>

        <div className="space-y-3">
          <Link href="/discover">
            <NeumorphicButton
              variant="flat"
              size="lg"
              className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white"
            >
              <Search className="w-5 h-5 mr-2" />
              Discover Athletes
            </NeumorphicButton>
          </Link>

          <Link href="/">
            <NeumorphicButton
              variant="flat"
              size="lg"
              className="w-full"
            >
              <Home className="w-5 h-5 mr-2" />
              Go Home
            </NeumorphicButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
