# ChatNIL Onboarding System

A comprehensive, role-based onboarding system for the ChatNIL platform that guides athletes, parents, and coaches through personalized setup flows.

## ✨ Features

- **🎯 Role-Based Flows** - Customized onboarding for Athletes, Parents/Guardians, and Coaches
- **📋 Multi-Step Wizard** - Progressive disclosure with step-by-step guidance
- **✅ Form Validation** - Zod schema validation with React Hook Form
- **💾 Progress Persistence** - Auto-saves progress to localStorage
- **🎨 Beautiful UI** - Consistent design with smooth transitions
- **📱 Mobile Responsive** - Works perfectly on all device sizes

## 🏗️ Architecture

### Core Components

```
/components/onboarding/
├── OnboardingRouter.tsx        # Main router and orchestrator
├── RoleSelectionScreen.tsx     # Initial role selection
├── ProgressIndicator.tsx       # Progress visualization
├── OnboardingComplete.tsx      # Completion screen
└── steps/                      # Individual step components
    ├── AthletePersonalInfoStep.tsx
    ├── AthleteSchoolInfoStep.tsx
    └── ... (all step components)
```

### State Management

```
/contexts/OnboardingContext.tsx  # Global onboarding state
/lib/onboarding-types.ts         # TypeScript types and Zod schemas
/lib/onboarding-registry.ts      # Step registration system
```

## 🔧 How It Works

### 1. Step Registry System

Each role has a defined set of steps with validation:

```typescript
const athleteSteps: OnboardingStep[] = [
  {
    id: 'athlete-personal',
    title: 'Personal Information',
    component: AthletePersonalInfoStep,
    validation: athletePersonalInfoSchema,
  },
  // ... more steps
];
```

### 2. Dynamic Step Loading

The router dynamically loads step components based on the user's role:

```typescript
const currentStep = getStepByIndex(role, currentStepIndex);
const StepComponent = currentStep.component;
```

### 3. Form State Persistence

Progress is automatically saved to localStorage and restored on page refresh:

```typescript
// Auto-save on state changes
useEffect(() => {
  if (state.hasStarted) {
    localStorage.setItem(ONBOARDING_STORAGE_KEYS.STATE, JSON.stringify(state));
  }
}, [state]);
```

## 📋 Onboarding Flows

### 🏆 Athlete Flow (4 Steps)

1. **Personal Information**
   - Name, date of birth, contact details
   - Parent email required for minors (<18)
   - Age validation and conditional fields

2. **School Information** *(Placeholder)*
   - School name and level
   - Graduation year, major, GPA

3. **Athletic Information** *(Placeholder)*
   - Primary sport and position
   - Achievements and statistics

4. **NIL Interests** *(Placeholder - Optional)*
   - Brand interests and goals
   - Social media handles

### 👨‍👩‍👧‍👦 Parent Flow (3 Steps)

1. **Personal Information** *(Placeholder)*
   - Parent/guardian details
   - Relationship to athlete

2. **Athlete Information** *(Placeholder)*
   - Student-athlete details
   - Sports and school info

3. **NIL Concerns** *(Placeholder)*
   - Concerns and questions
   - Support preferences

### 👨‍🏫 Coach Flow (3 Steps)

1. **Personal Information** *(Placeholder)*
   - Coach details and title
   - Contact information

2. **Institution Information** *(Placeholder)*
   - School/organization details
   - Department and experience

3. **NIL Role** *(Placeholder)*
   - Responsibilities and training needs
   - Current knowledge level

## 🚀 Usage

### Basic Implementation

```tsx
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import OnboardingRouter from '@/components/onboarding/OnboardingRouter';

export default function OnboardingPage() {
  const handleComplete = () => {
    // Handle completion
    window.location.href = '/dashboard';
  };

  return (
    <OnboardingProvider>
      <OnboardingRouter onComplete={handleComplete} />
    </OnboardingProvider>
  );
}
```

### Custom Step Component

```tsx
import { OnboardingStepProps } from '@/lib/onboarding-types';

export default function CustomStep({
  data,
  onNext,
  onBack,
  isFirst,
  isLast,
  isLoading
}: OnboardingStepProps) {
  const { nextStep, updateFormData } = useOnboarding();

  const handleSubmit = async (formData: any) => {
    updateFormData(formData);
    await nextStep(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Your form fields */}
    </form>
  );
}
```

## 🔍 Testing

Visit `/onboarding` to test the complete flow:

1. **Role Selection** - Choose between Athlete, Parent, or Coach
2. **Step Navigation** - Progress through each step
3. **Form Validation** - Test required fields and validation
4. **Progress Persistence** - Refresh page and check state restoration
5. **Completion** - Complete the flow and check data collection

## 🎨 Customization

### Adding New Steps

1. Create step component in `/components/onboarding/steps/`
2. Add validation schema in `/lib/onboarding-types.ts`
3. Register step in `/lib/onboarding-registry.ts`

### Custom Validation

```typescript
export const customStepSchema = z.object({
  field1: z.string().min(1, 'Required'),
  field2: z.number().optional(),
});
```

### Styling

The system uses Tailwind CSS with consistent design tokens:
- Orange theme for athletes
- Blue theme for parents
- Green theme for coaches

## 📊 Current Implementation Status

- ✅ **Core Architecture** - Router, context, registry system
- ✅ **Role Selection** - Beautiful selection screen
- ✅ **Progress Tracking** - Visual indicators and persistence
- ✅ **Athlete Step 1** - Complete personal info form with validation
- 🚧 **Remaining Steps** - Placeholder components (ready for development)
- ✅ **Completion Flow** - Success screen with role-specific messaging

## 🔄 Next Steps

1. **Complete Step Forms** - Implement remaining step components
2. **Database Integration** - Connect to Supabase for data persistence
3. **Authentication Integration** - Link with auth system
4. **Progressive Enhancement** - Add more advanced features
5. **Testing** - Add comprehensive test coverage

## 🤝 Contributing

When adding new steps:

1. Follow the existing component patterns
2. Use consistent validation schemas
3. Maintain mobile responsiveness
4. Add appropriate loading states
5. Include accessibility features

---

**The onboarding system is designed to be extensible, maintainable, and provide an excellent user experience for all ChatNIL user roles.**