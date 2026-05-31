export const vibeProfiles = [
  {
    headline: 'TIME TO WORKOUT.',
    buttonText: 'I\'M READY',
    statusText: 'ACTIVE',
  },
  {
    headline: 'REPROGRAM THE GRIND.',
    buttonText: 'COMMENCE TRAINING',
    statusText: 'OPTIMIZING',
  },
  {
    headline: 'YOU VS. YOU.',
    buttonText: 'LET\'S WORK',
    statusText: 'PERFORMING',
  },
  {
    headline: 'UNLEASH THE BEAST.',
    buttonText: 'ENTER BEASTMODE',
    statusText: 'BEASTMODE',
  },
];

/**
 * Gets the vibe profile for the current day.
 * It cycles through the profiles daily.
 */
export const getDailyVibe = () => {
  const dayOfMonth = new Date().getDate();
  const index = (dayOfMonth - 1) % vibeProfiles.length; // Use dayOfMonth - 1 to start from index 0 on the 1st
  return vibeProfiles[index];
};
