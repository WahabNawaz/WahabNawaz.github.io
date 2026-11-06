// Where the character sits in the home hero, shared between the character
// (Avatar.tsx writes it every frame) and the big hand it sits on
// (HeroHands.tsx reads it), and the other way round: the hand reports where
// the top of its index finger is, and the character lands and sits there.
export const heroSeat = {
  active: false, // the home hero is in view
  hipY: -0.1, // seated hip height / depth, in character units
  hipZ: 0,
  // top of the seat hand's index finger (world), written by HeroHands.tsx;
  // the character lands on it and sits there
  ready: false,
  fx: 0,
  fy: 0,
  fz: 0,
};
