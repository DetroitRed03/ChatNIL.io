'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { Award, Sparkles, TrendingUp } from 'lucide-react';
import { useRef } from 'react';

export function AnimationExamples() {
  return (
    <div className="w-full max-w-6xl space-y-16">

      {/* Parallax Depth */}
      <Section title="Parallax Depth" description="Multi-layer scrolling with depth perception">
        <ParallaxDemo />
      </Section>

      {/* Liquid Morph */}
      <Section title="Liquid Morphing" description="Smooth shape transformations with elastic easing">
        <LiquidMorphDemo />
      </Section>

      {/* Silk Transitions */}
      <Section title="Silk-Smooth Transitions" description="Premium easing curves for luxurious feel">
        <SilkTransitionsDemo />
      </Section>

      {/* Stagger Animations */}
      <Section title="Elegant Stagger" description="Sequential reveals with relaxed timing">
        <StaggerDemo />
      </Section>

      {/* Hover Interactions */}
      <Section title="Interactive Hover Effects" description="Responsive feedback with spring physics">
        <HoverInteractionsDemo />
      </Section>

    </div>
  );
}

// Components

function Section({ title, description, children }: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-[#1a1d20] tracking-tight mb-1">{title}</h3>
        <p className="text-[#6c757d]">{description}</p>
      </div>
      <div
        className="bg-gradient-to-br from-white via-[#FFFBF7] to-white rounded-2xl border-2 border-[#E8E4DF] p-8 overflow-hidden"
        style={{
          boxShadow: `
            0 4px 12px -2px rgba(234, 88, 12, 0.05),
            inset 0 1px 0 0 rgba(255, 255, 255, 0.9)
          `
        }}
      >
        {children}
      </div>
    </div>
  );
}

function ParallaxDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -150]);

  return (
    <div ref={containerRef} className="relative h-96 bg-gradient-to-br from-[#FAF6F1] to-[#FFF8F0] rounded-xl overflow-hidden">
      {/* Background layer */}
      <motion.div
        style={{ y: y1 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div
          className="w-96 h-96 rounded-full bg-gradient-to-br from-[#ea580c]/10 to-[#92400e]/10"
          style={{
            filter: 'blur(40px)'
          }}
        />
      </motion.div>

      {/* Middle layer */}
      <motion.div
        style={{ y: y2 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div
          className="w-64 h-64 rounded-full bg-gradient-to-br from-[#fcd34d]/20 to-[#ea580c]/20"
          style={{
            filter: 'blur(30px)'
          }}
        />
      </motion.div>

      {/* Foreground layer */}
      <motion.div
        style={{ y: y3 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div
          className="px-12 py-8 rounded-2xl bg-gradient-to-br from-white to-[#FFFBF7] border-2 border-[#E8E4DF]"
          style={{
            boxShadow: `
              0 20px 50px -10px rgba(234, 88, 12, 0.15),
              inset 0 1px 0 0 rgba(255, 255, 255, 0.9)
            `
          }}
        >
          <h4 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-[#ea580c] to-[#92400e] bg-clip-text text-transparent text-center">
            Scroll to see parallax
          </h4>
        </div>
      </motion.div>
    </div>
  );
}

function LiquidMorphDemo() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          whileHover={{
            borderRadius: ['24px', '48px', '24px'],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 1.5,
            ease: [0.23, 1, 0.32, 1], // fluid easing
            times: [0, 0.33, 0.66, 1]
          }}
          className="aspect-square bg-gradient-to-br from-[#ea580c] via-[#c2410c] to-[#92400e] cursor-pointer relative overflow-hidden"
          style={{
            boxShadow: `
              0 10px 30px -5px rgba(234, 88, 12, 0.3),
              inset 0 -4px 8px 0 rgba(0, 0, 0, 0.2)
            `
          }}
        >
          {/* Liquid shimmer */}
          <motion.div
            animate={{
              x: ['-100%', '200%'],
              y: ['-100%', '200%'],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'linear',
              delay: index * 0.5
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            style={{
              transform: 'rotate(45deg)',
              filter: 'blur(20px)'
            }}
          />

          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              whileHover={{ scale: 1.2, rotate: 360 }}
              transition={{
                duration: 0.8,
                ease: [0.23, 1, 0.32, 1]
              }}
            >
              <Award className="w-16 h-16 text-white" />
            </motion.div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function SilkTransitionsDemo() {
  const items = ['Premium', 'Sophisticated', 'Elegant', 'Luxurious'];

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <motion.div
          key={item}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            delay: index * 0.15,
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94] // silk easing
          }}
          whileHover={{
            x: 10,
            scale: 1.02,
            transition: {
              type: 'spring',
              stiffness: 200,
              damping: 35
            }
          }}
          className="p-6 rounded-2xl bg-gradient-to-br from-white to-[#FFFBF7] border-2 border-[#E8E4DF] cursor-pointer group"
          style={{
            boxShadow: `
              0 4px 12px -2px rgba(234, 88, 12, 0.05),
              inset 0 1px 0 0 rgba(255, 255, 255, 0.9)
            `
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ea580c] to-[#92400e] flex items-center justify-center"
                style={{
                  boxShadow: `
                    0 4px 12px -2px rgba(234, 88, 12, 0.3),
                    inset 0 -2px 4px 0 rgba(0, 0, 0, 0.2)
                  `
                }}
              >
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-[#1a1d20] tracking-tight">
                {item}
              </span>
            </div>

            <motion.div
              initial={{ rotate: 0 }}
              whileHover={{ rotate: 90 }}
              transition={{
                duration: 0.6,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              className="text-[#ea580c]"
            >
              <TrendingUp className="w-6 h-6" />
            </motion.div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function StaggerDemo() {
  const cards = Array.from({ length: 9 }, (_, i) => i);

  return (
    <div className="grid grid-cols-3 gap-4">
      {cards.map((card, index) => (
        <motion.div
          key={card}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            delay: index * 0.08, // relaxed stagger
            duration: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          whileHover={{
            scale: 1.05,
            y: -4,
            transition: {
              type: 'spring',
              stiffness: 200,
              damping: 35
            }
          }}
          className="aspect-square rounded-xl bg-gradient-to-br from-[#FAF6F1] to-[#FFF8F0] border-2 border-[#E8E4DF] flex items-center justify-center cursor-pointer relative overflow-hidden group"
          style={{
            boxShadow: `
              inset 2px 2px 4px rgba(0, 0, 0, 0.03),
              inset -2px -2px 4px rgba(255, 255, 255, 0.8)
            `
          }}
        >
          <span className="text-3xl font-bold text-[#ea580c] relative z-10">
            {card + 1}
          </span>

          {/* Hover gradient */}
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-gradient-to-br from-[#ea580c]/10 to-[#92400e]/10"
          />
        </motion.div>
      ))}
    </div>
  );
}

function HoverInteractionsDemo() {
  const interactions = [
    {
      label: 'Scale Up',
      animation: { scale: 1.1, y: -4 }
    },
    {
      label: 'Rotate',
      animation: { rotate: 10, scale: 1.05 }
    },
    {
      label: 'Tilt',
      animation: { rotateX: 10, rotateY: 10, scale: 1.05 }
    },
    {
      label: 'Shimmer',
      animation: { scale: 1.05 }
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {interactions.map((interaction, index) => (
        <motion.div
          key={interaction.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: index * 0.1,
            duration: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          whileHover={interaction.animation}
          style={{ perspective: '1000px' }}
          className="cursor-pointer"
        >
          <div
            className="p-8 rounded-2xl bg-gradient-to-br from-white to-[#FFFBF7] border-2 border-[#E8E4DF] text-center relative overflow-hidden group"
            style={{
              boxShadow: `
                0 4px 12px -2px rgba(234, 88, 12, 0.05),
                inset 0 1px 0 0 rgba(255, 255, 255, 0.9)
              `
            }}
          >
            {/* Icon */}
            <div
              className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#ea580c] to-[#92400e] flex items-center justify-center mx-auto mb-4"
              style={{
                boxShadow: `
                  0 4px 12px -2px rgba(234, 88, 12, 0.3),
                  inset 0 -2px 4px 0 rgba(0, 0, 0, 0.2)
                `
              }}
            >
              <Award className="w-8 h-8 text-white" />
            </div>

            <h4 className="font-bold text-[#1a1d20] text-lg tracking-tight mb-2">
              {interaction.label}
            </h4>
            <p className="text-sm text-[#6c757d]">Hover to interact</p>

            {/* Shimmer effect for shimmer card */}
            {interaction.label === 'Shimmer' && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '200%' }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              />
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
