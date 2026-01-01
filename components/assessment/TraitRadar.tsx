'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface TraitDataPoint {
  trait: string;
  traitName: string;
  score: number;
  colorHex?: string;
}

interface TraitRadarProps {
  data: TraitDataPoint[];
  size?: number;
  className?: string;
}

export function TraitRadar({ data, size = 300, className }: TraitRadarProps) {
  const padding = 60; // Padding for labels
  const center = size / 2;
  const maxRadius = (size / 2) - 30; // Radar chart radius
  const angleStep = (2 * Math.PI) / data.length;
  const containerWidth = size + padding * 2;
  const containerHeight = size + padding * 2;

  // Generate polygon points for the data
  const generatePolygonPoints = (values: number[]): string => {
    return values
      .map((value, index) => {
        const angle = index * angleStep - Math.PI / 2; // Start from top
        const radius = (value / 100) * maxRadius;
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
        return `${x},${y}`;
      })
      .join(' ');
  };

  // Generate grid circles
  const gridCircles = [20, 40, 60, 80, 100];

  // Generate axis lines
  const axisLines = data.map((_, index) => {
    const angle = index * angleStep - Math.PI / 2;
    const x2 = center + maxRadius * Math.cos(angle);
    const y2 = center + maxRadius * Math.sin(angle);
    return { x1: center, y1: center, x2, y2 };
  });

  // Generate labels positions (relative to container with padding)
  const labelPositions = data.map((item, index) => {
    const angle = index * angleStep - Math.PI / 2;
    const labelRadius = maxRadius + 20;
    const x = padding + center + labelRadius * Math.cos(angle);
    const y = padding + center + labelRadius * Math.sin(angle);
    return { x, y, name: item.traitName, score: item.score };
  });

  const dataPoints = generatePolygonPoints(data.map((d) => d.score));

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={{ width: containerWidth, height: containerHeight, maxWidth: '100%' }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute"
        style={{ left: padding, top: padding }}
      >
        {/* Background grid circles */}
        {gridCircles.map((value) => {
          const radius = (value / 100) * maxRadius;
          return (
            <circle
              key={value}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="#E5E7EB"
              strokeWidth={1}
              strokeDasharray={value === 100 ? 'none' : '2,2'}
            />
          );
        })}

        {/* Axis lines */}
        {axisLines.map((line, index) => (
          <line
            key={index}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="#E5E7EB"
            strokeWidth={1}
          />
        ))}

        {/* Data polygon - gradient fill */}
        <defs>
          <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.3} />
          </linearGradient>
        </defs>

        {/* Data area */}
        <polygon
          points={dataPoints}
          fill="url(#radarGradient)"
          stroke="#6366F1"
          strokeWidth={2}
          className="transition-all duration-500"
        />

        {/* Data points */}
        {data.map((item, index) => {
          const angle = index * angleStep - Math.PI / 2;
          const radius = (item.score / 100) * maxRadius;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);

          return (
            <g key={item.trait}>
              {/* Point */}
              <circle
                cx={x}
                cy={y}
                r={6}
                fill="white"
                stroke={item.colorHex || '#6366F1'}
                strokeWidth={2}
                className="transition-all duration-300 hover:r-8"
              />
              {/* Inner point */}
              <circle
                cx={x}
                cy={y}
                r={3}
                fill={item.colorHex || '#6366F1'}
              />
            </g>
          );
        })}
      </svg>

      {/* Labels outside SVG for better text rendering */}
      {labelPositions.map((pos, index) => {
        const containerCenter = padding + center;
        const isLeft = pos.x < containerCenter;
        const isTop = pos.y < containerCenter;

        return (
          <div
            key={data[index].trait}
            className={cn(
              'absolute transform text-xs font-medium',
              isLeft ? '-translate-x-full pr-1' : 'pl-1',
              isTop ? '-translate-y-full' : ''
            )}
            style={{
              left: pos.x,
              top: pos.y,
            }}
          >
            <div className="flex flex-col items-center">
              <span className="text-text-primary whitespace-nowrap text-[11px]">
                {pos.name}
              </span>
              <span
                className="text-[9px] font-semibold px-1 rounded-full"
                style={{
                  backgroundColor: `${data[index].colorHex || '#6366F1'}20`,
                  color: data[index].colorHex || '#6366F1',
                }}
              >
                {pos.score}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Simplified bar chart alternative for mobile
interface TraitBarChartProps {
  data: TraitDataPoint[];
  className?: string;
}

export function TraitBarChart({ data, className }: TraitBarChartProps) {
  const sortedData = [...data].sort((a, b) => b.score - a.score);

  return (
    <div className={cn('space-y-3', className)}>
      {sortedData.map((item, index) => (
        <div key={item.trait} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-text-primary flex items-center gap-2">
              {index < 3 && (
                <span
                  className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold',
                    index === 0 && 'bg-yellow-100 text-yellow-700',
                    index === 1 && 'bg-gray-100 text-gray-600',
                    index === 2 && 'bg-orange-100 text-orange-700'
                  )}
                >
                  {index + 1}
                </span>
              )}
              {item.traitName}
            </span>
            <span
              className="font-semibold"
              style={{ color: item.colorHex || '#6366F1' }}
            >
              {item.score}%
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${item.score}%`,
                backgroundColor: item.colorHex || '#6366F1',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
