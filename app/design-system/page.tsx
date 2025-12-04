'use client';

import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Input,
  Badge,
  Avatar,
} from '@/components/ui';
import { formatCurrency, formatNumber } from '@/lib/utils';
import {
  Heart,
  Share2,
  Download,
  Mail,
  Lock,
  Search,
  Check,
  X,
  Star,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 bg-clip-text text-transparent">
            ChatNIL Design System
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            A comprehensive, production-ready UI component library built with Tailwind CSS and React
          </p>
        </div>

        {/* Color Palette */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Color Palette</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Primary Colors */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Primary - Orange</CardTitle>
                <CardDescription>ChatNIL Brand Color</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-lg bg-primary-500 shadow-md" />
                  <span className="text-sm font-mono">#f97316</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                    <div
                      key={shade}
                      className={`h-10 rounded bg-primary-${shade}`}
                      title={`primary-${shade}`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Secondary Colors */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Secondary - Charcoal</CardTitle>
                <CardDescription>Professional Contrast</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-lg bg-secondary-500 shadow-md" />
                  <span className="text-sm font-mono">#495057</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                    <div
                      key={shade}
                      className={`h-10 rounded bg-secondary-${shade}`}
                      title={`secondary-${shade}`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Accent Colors */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Accent - Gold</CardTitle>
                <CardDescription>Premium & Achievement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-lg bg-accent-500 shadow-md" />
                  <span className="text-sm font-mono">#f59e0b</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                    <div
                      key={shade}
                      className={`h-10 rounded bg-accent-${shade}`}
                      title={`accent-${shade}`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Typography */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Typography</h2>
          <Card variant="elevated">
            <CardContent className="space-y-4 pt-6">
              <div className="text-6xl font-bold">Heading 1 - 60px</div>
              <div className="text-5xl font-bold">Heading 2 - 48px</div>
              <div className="text-4xl font-semibold">Heading 3 - 36px</div>
              <div className="text-3xl font-semibold">Heading 4 - 30px</div>
              <div className="text-2xl font-medium">Heading 5 - 24px</div>
              <div className="text-xl">Body Large - 20px</div>
              <div className="text-base">Body Regular - 16px</div>
              <div className="text-sm">Body Small - 14px</div>
              <div className="text-xs">Caption - 12px</div>
            </CardContent>
          </Card>
        </section>

        {/* Buttons */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Buttons</h2>
          <Card variant="elevated">
            <CardContent className="space-y-8 pt-6">
              {/* Variants */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-700">Variants</h3>
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="accent">Accent</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="danger">Danger</Button>
                  <Button variant="success">Success</Button>
                </div>
              </div>

              {/* Sizes */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-700">Sizes</h3>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                </div>
              </div>

              {/* With Icons */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-700">With Icons</h3>
                <div className="flex flex-wrap gap-3">
                  <Button leftIcon={<Heart className="h-4 w-4" />}>Like</Button>
                  <Button rightIcon={<Share2 className="h-4 w-4" />}>Share</Button>
                  <Button variant="secondary" leftIcon={<Download className="h-4 w-4" />}>
                    Download
                  </Button>
                </div>
              </div>

              {/* States */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-700">States</h3>
                <div className="flex flex-wrap gap-3">
                  <Button isLoading>Loading...</Button>
                  <Button disabled>Disabled</Button>
                  <Button variant="accent" isLoading>
                    Processing
                  </Button>
                </div>
              </div>

              {/* Full Width */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-700">Full Width</h3>
                <Button fullWidth variant="primary">
                  Full Width Button
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Cards */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="default">
              <CardHeader>
                <CardTitle>Default Card</CardTitle>
                <CardDescription>Standard card with default styling</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  This is a default card with standard shadow and border.
                </p>
              </CardContent>
              <CardFooter>
                <Button size="sm" variant="ghost">Learn More</Button>
              </CardFooter>
            </Card>

            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Elevated Card</CardTitle>
                <CardDescription>Card with enhanced shadow</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  This card has an elevated shadow that increases on hover.
                </p>
              </CardContent>
              <CardFooter>
                <Button size="sm" variant="primary">Get Started</Button>
              </CardFooter>
            </Card>

            <Card variant="default" clickable>
              <CardHeader>
                <CardTitle>Clickable Card</CardTitle>
                <CardDescription>Interactive card with hover effect</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  This card is clickable and responds to hover with visual feedback.
                </p>
              </CardContent>
              <CardFooter>
                <Button size="sm" variant="accent">Click Me</Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* Inputs */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Inputs</h2>
          <Card variant="elevated">
            <CardContent className="space-y-6 pt-6">
              <Input
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                leftIcon={<Mail className="h-4 w-4" />}
                helperText="We'll never share your email with anyone else."
              />

              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                leftIcon={<Lock className="h-4 w-4" />}
                required
              />

              <Input
                label="Search"
                type="text"
                placeholder="Search..."
                leftIcon={<Search className="h-4 w-4" />}
              />

              <Input
                label="Error State"
                type="text"
                defaultValue="invalid@"
                error="Please enter a valid email address"
                variant="error"
              />

              <Input
                label="Success State"
                type="text"
                defaultValue="success@example.com"
                variant="success"
                rightIcon={<Check className="h-4 w-4 text-success-600" />}
              />
            </CardContent>
          </Card>
        </section>

        {/* Badges */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Badges</h2>
          <Card variant="elevated">
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-700">Variants</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="primary">Primary</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="accent">Accent</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="error">Error</Badge>
                  <Badge variant="gray">Gray</Badge>
                  <Badge variant="outline">Outline</Badge>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-700">Sizes</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge size="sm">Small</Badge>
                  <Badge size="md">Medium</Badge>
                  <Badge size="lg">Large</Badge>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-700">With Icons</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="success" leftIcon={<Check className="h-3 w-3" />}>
                    Verified
                  </Badge>
                  <Badge variant="error" leftIcon={<X className="h-3 w-3" />}>
                    Rejected
                  </Badge>
                  <Badge variant="warning" leftIcon={<AlertCircle className="h-3 w-3" />}>
                    Pending
                  </Badge>
                  <Badge variant="primary" rightIcon={<Star className="h-3 w-3" />}>
                    Premium
                  </Badge>
                  <Badge variant="accent" rightIcon={<TrendingUp className="h-3 w-3" />}>
                    Trending
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Avatars */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Avatars</h2>
          <Card variant="elevated">
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-700">Sizes</h3>
                <div className="flex flex-wrap items-end gap-4">
                  <Avatar size="xs" fallback="XS" />
                  <Avatar size="sm" fallback="SM" />
                  <Avatar size="md" fallback="MD" />
                  <Avatar size="lg" fallback="LG" />
                  <Avatar size="xl" fallback="XL" />
                  <Avatar size="2xl" fallback="2XL" />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-700">With Fallback Initials</h3>
                <div className="flex flex-wrap gap-4">
                  <Avatar size="lg" fallback="John Doe" />
                  <Avatar size="lg" fallback="Sarah Smith" />
                  <Avatar size="lg" fallback="Mike Johnson" />
                  <Avatar size="lg" fallback="Emily Davis" />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-700">With Status Indicators</h3>
                <div className="flex flex-wrap gap-4">
                  <Avatar size="lg" fallback="Online User" status="online" />
                  <Avatar size="lg" fallback="Offline User" status="offline" />
                  <Avatar size="lg" fallback="Busy User" status="busy" />
                  <Avatar size="lg" fallback="Away User" status="away" />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-700">Without Fallback (Icon)</h3>
                <div className="flex flex-wrap gap-4">
                  <Avatar size="sm" />
                  <Avatar size="md" />
                  <Avatar size="lg" />
                  <Avatar size="xl" />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Utility Functions */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Utility Functions</h2>
          <Card variant="elevated">
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-700">formatCurrency()</h3>
                <div className="space-y-1 font-mono text-sm">
                  <p>formatCurrency(1500) → {formatCurrency(1500)}</p>
                  <p>formatCurrency(2500000) → {formatCurrency(2500000)}</p>
                  <p>formatCurrency(750) → {formatCurrency(750)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-700">formatNumber()</h3>
                <div className="space-y-1 font-mono text-sm">
                  <p>formatNumber(1500) → {formatNumber(1500)}</p>
                  <p>formatNumber(25000) → {formatNumber(25000)}</p>
                  <p>formatNumber(2500000) → {formatNumber(2500000)}</p>
                  <p>formatNumber(234) → {formatNumber(234)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <div className="text-center py-8 space-y-2">
          <p className="text-gray-600">
            Built with React, Next.js, Tailwind CSS, and TypeScript
          </p>
          <Badge variant="primary">v1.0.0</Badge>
        </div>
      </div>
    </div>
  );
}
