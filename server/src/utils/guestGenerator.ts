const ADJECTIVES = [
  'Neon',
  'Cyber',
  'Electric',
  'Quantum',
  'Solar',
  'Astral',
  'Vivid',
  'Cosmic',
  'Hyper',
  'Turbo',
  'Sonic',
  'Pixel',
];

const ANIMALS = [
  'Fox',
  'Lynx',
  'Falcon',
  'Bear',
  'Otter',
  'Wolf',
  'Phoenix',
  'Panda',
  'Hawk',
  'Tiger',
  'Eagle',
  'Cheetah',
];

const NEON_COLORS = [
  '#06b6d4', // Cyan
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#3b82f6', // Blue
  '#a855f7', // Purple
  '#14b8a6', // Teal
  '#f43f5e', // Rose
];

export function generateGuestProfile(customName?: string, customColor?: string) {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const randomSuffix = Math.floor(100 + Math.random() * 900);

  const name = customName?.trim() || `Guest ${adj} ${animal} #${randomSuffix}`;
  const avatarColor =
    customColor?.trim() ||
    NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];

  return { name, avatarColor };
}
