// Where the character sits in the home hero, shared between the character
// (Avatar.tsx writes it every frame) and the big hand it sits on
// (HeroHands.tsx reads it). The hand is placed from the hero *target* spot, so
// it stays put while the character walks over to it.
export const heroSeat = {
  active: false, // the home hero is in view
  x: 0, // target position of the character (world units)
  y: 0,
  s: 1, // character scale
  ry: 0, // character turn at the seat
  hipY: -0.1, // seated hip height / depth, in character units
  hipZ: 0,
};
