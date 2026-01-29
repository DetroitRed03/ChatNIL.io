'use client';

interface OnboardingStepProps {
  number: 1 | 2 | 3;
  title: string;
  description: string;
  isActive: boolean;
}

export function OnboardingStep({
  number,
  title,
  description,
  isActive
}: OnboardingStepProps) {
  return (
    <div
      data-testid={`onboarding-step-${number}`}
      className={`text-center ${isActive ? 'opacity-100' : 'opacity-40'}`}
    >
      {/* Number Circle */}
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
        isActive
          ? 'bg-orange-500 text-white'
          : 'bg-gray-200 text-gray-500'
      }`}>
        <span className="text-lg font-bold">{number}</span>
      </div>

      {/* Title */}
      <h3 className={`font-semibold mb-1 ${
        isActive ? 'text-gray-900' : 'text-gray-500'
      }`}>
        {title}
      </h3>

      {/* Description */}
      <p className={`text-sm max-w-[120px] mx-auto ${
        isActive ? 'text-gray-600' : 'text-gray-400'
      }`}>
        {description}
      </p>
    </div>
  );
}
