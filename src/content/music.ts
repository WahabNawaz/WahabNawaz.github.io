// Playground tracks. Use music you have the rights to (for example free tracks
// from pixabay.com/music). Put the MP3 in /public/audio/ and add it here.
// `bpm` makes the placeholder dance on the beat; `dance` picks the avatar clip.
// The "Demo beat" is generated in the browser, so it needs no file.

export type Track = {
  id: string;
  title: string;
  artist: string;
  src?: string; // omit for the generated demo beat
  bpm: number;
  dance: "dance1" | "dance2";
};

export const tracks: Track[] = [
  { id: "demo", title: "Demo beat", artist: "Generated in your browser", bpm: 112, dance: "dance1" },
  // { id: "song-1", title: "Song title", artist: "Artist", src: "/audio/song-1.mp3", bpm: 120, dance: "dance1" },
  // { id: "song-2", title: "Song title", artist: "Artist", src: "/audio/song-2.mp3", bpm: 96, dance: "dance2" },
];
