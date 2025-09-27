# Optimize UI layout and components for iPad 13-inch display

## Description
The Will Counter app needs UI adjustments to properly support iPad 13-inch displays, ensuring optimal user experience on larger screens.

## Current State
- App configuration shows `supportsTablet: true` in `app.config.js`
- Current components are designed primarily for phone screens
- May have layout issues on larger iPad displays

## Requirements
- Optimize layout spacing and component sizing for iPad 13-inch screens
- Ensure proper responsive design across all screens (Login, Counter, Statistics, Settings)
- Consider using iPad-specific layouts where beneficial (e.g., side-by-side layouts)
- Test on iPad simulator/device to ensure proper rendering

## Acceptance Criteria
- [ ] All screens render properly on iPad 13-inch without layout issues
- [ ] Text and UI elements are appropriately sized for larger screens
- [ ] Touch targets meet iPad accessibility guidelines (44pt minimum)
- [ ] Navigation and interactions work smoothly on iPad
- [ ] App passes iPad-specific review guidelines

## Technical Requirements
- Update StyleSheet definitions to include iPad-specific styles
- Use responsive design patterns (e.g., Dimensions API, device detection)
- Test with React Native's built-in device size detection
- Ensure compatibility with iOS 13+ on iPad

## Files Likely to be Modified
- `frontend/src/components/auth/LoginScreen.tsx`
- `frontend/src/components/counter/WillCounterScreen.tsx`
- `frontend/src/components/settings/SettingsScreen.tsx`
- `frontend/src/components/statistics/StatisticsScreen.tsx`

## Labels
enhancement, ui/ux, ios, ipad

## Effort Estimate
Medium (5-8 hours)