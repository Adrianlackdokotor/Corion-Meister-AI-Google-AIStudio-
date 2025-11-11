// Sounds have been disabled as per user request. This class is now a shell
// to prevent errors in components that still reference it.

export class AudioManager {
  constructor(volume: number, isMuted: boolean) {
    // Constructor is intentionally left empty.
    // No audio context is created.
  }

  public play(soundName: 'click' | 'correct' | 'incorrect' | 'partial') {
    // The play method is intentionally left empty to disable all UI sounds.
    return;
  }
}
