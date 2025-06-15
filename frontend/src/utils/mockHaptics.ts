// Mock haptic feedback for testing
export const HapticFeedback = {
  trigger: (type: string) => {
    console.log(`📳 Haptic feedback triggered: ${type} (mock)`);
  }
};

export default HapticFeedback;