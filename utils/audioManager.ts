// FIX: incorrectSound and partialSound were missing from the import. They have been added to sounds.ts and imported here.
import { clickSound, correctSound, incorrectSound, partialSound } from '../assets/sounds';

export class AudioManager {
  private volume: number;
  private isMuted: boolean;
  private audioContext: AudioContext;
  private sounds: { [key: string]: AudioBuffer } = {};

  constructor(volume: number, isMuted: boolean) {
    this.volume = volume;
    this.isMuted = isMuted;
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.loadSounds();
  }

  private async loadSound(name: string, dataUri: string) {
    try {
      const base64String = dataUri.split(',')[1];
      if (!base64String) throw new Error('Invalid data URI format');
      
      const binaryString = window.atob(base64String);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
      }
      
      const arrayBuffer = bytes.buffer;
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.sounds[name] = audioBuffer;
    } catch (error) {
      console.error(`Failed to load sound: ${name}`, error);
    }
  }

  private loadSounds() {
    this.loadSound('click', clickSound);
    this.loadSound('correct', correctSound);
    this.loadSound('incorrect', incorrectSound);
    this.loadSound('partial', partialSound);
  }

  public play(soundName: 'click' | 'correct' | 'incorrect' | 'partial') {
    // FIX: The check for 'suspended' was contradictory. Removed it and added a check for 'closed' to prevent errors.
    if (this.isMuted || !this.sounds[soundName] || this.audioContext.state === 'closed') {
      return;
    }
    // Resume context if it was suspended by browser autoplay policy
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    const source = this.audioContext.createBufferSource();
    source.buffer = this.sounds[soundName];
    
    const gainNode = this.audioContext.createGain();
    gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    source.start(0);
  }
}