/**
 * Kit metadata: descriptions and color categories.
 * Colors map to CSS variables: --kit-electronics, --kit-motors, --kit-sensors
 */
export const KIT_META = {
  'Arduino Starter Kit': {
    description: 'Essential electronics for learning Arduino basics',
    color: 'electronics',
    icon: '⚡',
  },
  'Motor Kit': {
    description: 'Everything you need for robot mobility',
    color: 'motors',
    icon: '⚙️',
  },
  'Sensor Pack': {
    description: 'Environmental sensing and detection components',
    color: 'sensors',
    icon: '📡',
  },
};

/**
 * Get metadata for a kit by name.
 * Returns default values if kit not found.
 */
export function getKitMeta(kitName) {
  return KIT_META[kitName] || {
    description: 'A collection of useful components',
    color: 'default',
    icon: '📦',
  };
}

/**
 * Map color category to CSS variable name.
 */
export function getKitColorVar(color) {
  const colorMap = {
    electronics: '--kit-electronics',
    motors: '--kit-motors',
    sensors: '--kit-sensors',
    default: '--kit-default',
  };
  return colorMap[color] || colorMap.default;
}
