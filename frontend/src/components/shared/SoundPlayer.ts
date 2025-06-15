// Simplified sound player for testing (removes react-native-sound dependency)
class SoundPlayer {
  private static initialized = false;

  static initialize() {
    if (this.initialized) return;
    console.log('🔊 Sound player initialized (mock)');
    this.initialized = true;
  }

  static playCountSound() {
    console.log('🔊 Playing count sound (mock)');
  }

  static setVolume(volume: number) {
    console.log(`🔊 Setting volume to ${volume} (mock)`);
  }

  static stop() {
    console.log('🔊 Stopping sound (mock)');
  }

  static release() {
    console.log('🔊 Releasing sound player (mock)');
    this.initialized = false;
  }
}

export default SoundPlayer;