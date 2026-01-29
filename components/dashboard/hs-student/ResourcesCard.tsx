'use client';

import { ExternalLink, FileText, Video, Headphones, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

const resources = [
  {
    title: 'NIL 101 Guide',
    description: 'Everything you need to know about NIL',
    type: 'guide',
    icon: FileText,
    color: 'text-blue-400',
    href: '/learn/nil-101',
  },
  {
    title: 'State Rules Lookup',
    description: 'Check your state\'s NIL regulations',
    type: 'tool',
    icon: BookOpen,
    color: 'text-purple-400',
    href: '/tools/state-rules',
  },
  {
    title: 'Personal Brand Workshop',
    description: '15-minute video workshop',
    type: 'video',
    icon: Video,
    color: 'text-green-400',
    href: '/learn/brand-workshop',
  },
  {
    title: 'Athlete Podcasts',
    description: 'Learn from other athletes',
    type: 'audio',
    icon: Headphones,
    color: 'text-orange-400',
    href: '/resources/podcasts',
  },
];

export function ResourcesCard() {
  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-400" />
          Quick Resources
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {resources.map((resource) => (
            <a
              key={resource.title}
              href={resource.href}
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors group"
            >
              <div className={`p-2 rounded-lg bg-gray-800 ${resource.color}`}>
                <resource.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                  {resource.title}
                </p>
                <p className="text-xs text-gray-500 truncate">{resource.description}</p>
              </div>
              <ExternalLink className="h-4 w-4 text-gray-500 group-hover:text-gray-400 flex-shrink-0" />
            </a>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-700">
          <a
            href="/resources"
            className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            View all resources
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
