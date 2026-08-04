// Journey stages and their resource links. Kept small and curated on
// purpose -- these drive both the vertical Journey timeline and the
// stage-dependent bottom nav, so each stage needs exactly a few
// well-chosen links, not an exhaustive menu.
export const JOURNEY_STAGES = [
  {
    key: 'reveal',
    label: 'Reveal',
    tagline: 'Understand what is underneath.',
    goal: 'Notice patterns, name what you feel, and get honest about what you’re avoiding.',
    links: [
      { label: 'Reflect', to: '/journal', icon: 'journal' },
      { label: 'Warning signs', to: '/prep', icon: 'prep' },
      { label: 'Notice a pattern', to: '/moment', icon: 'stop' },
    ],
  },
  {
    key: 'restore',
    label: 'Restore',
    tagline: 'Rebuild the life around the struggle.',
    goal: 'Choose small, specific practices across your relationships, body, mind, emotions, and faith.',
    links: [
      { label: 'My practices', to: '/restore', icon: 'restore' },
      { label: 'Stay connected', to: '/people', icon: 'people' },
      { label: 'Reflect', to: '/journal', icon: 'journal' },
    ],
  },
  {
    key: 'strengthen',
    label: 'Strengthen',
    tagline: 'Keep growing, without a finish line.',
    goal: 'Fewer check-ins, deeper roots. Stay connected and keep returning to your why.',
    links: [
      { label: 'Stay connected', to: '/people', icon: 'people' },
      { label: 'Weekly reflection', to: '/journal', icon: 'journal' },
      { label: 'My why', to: '/prep', icon: 'prep' },
    ],
  },
]

// The Moment hub: quick orientation + resources for Prep / Stop / Recover.
export const MOMENT_PARTS = [
  {
    key: 'prep',
    label: 'Prep',
    to: '/prep',
    tagline: 'What am I going to do instead?',
    description: 'Build your plan while you’re steady: warning signs, triggers, and your why.',
  },
  {
    key: 'stop',
    label: 'Stop',
    to: '/stop',
    tagline: 'Regain agency, right now.',
    description: 'A calm, guided pause when temptation is happening in this moment.',
  },
  {
    key: 'recover',
    label: 'Recover',
    to: '/recover',
    tagline: 'Come back.',
    description: 'After a difficult moment: reflect, learn, reconnect, and return to your life.',
  },
]
