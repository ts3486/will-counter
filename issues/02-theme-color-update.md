# Update app theme colors for improved visual design

## Description
Update the app's color scheme to create a more modern, cohesive visual identity while maintaining accessibility and brand consistency.

## Current State
Analysis of current colors used:
- Primary purple: `#6C5CE7` (login button, switches)
- Blue accent: `#3B82F6` (icons, interactive elements)
- Text colors: `#2D3436` (primary), `#636E72` (secondary), `#64748B` (muted)
- Background: `#F8F9FA` (light gray), `#FFFFFF` (white)
- Error: `#EF4444` (red)
- Card backgrounds: `#F8FAFC`

## Requirements
- Define a new cohesive color palette
- Maintain WCAG accessibility standards (contrast ratios)
- Update all color references consistently across the app
- Consider dark mode preparation (though not necessarily implementing it now)

## Proposed Color Updates
- Primary: Update purple tone for better brand identity
- Secondary: Refine blue accent colors
- Neutral grays: Optimize for better hierarchy
- Success/Warning/Error: Ensure accessibility compliance

## Acceptance Criteria
- [ ] New color palette is defined and documented
- [ ] All hardcoded colors are replaced with new palette
- [ ] App maintains visual consistency across all screens
- [ ] Color contrast meets WCAG AA standards
- [ ] Colors work well on both iOS and Android
- [ ] Update splash screen and icon colors if needed

## Technical Requirements
- Create a centralized color constants file
- Update all StyleSheet color references
- Update `app.config.js` splash screen colors
- Consider creating a theme provider for future extensibility

## Files to be Modified
- Create: `frontend/src/constants/colors.ts`
- Update: All component StyleSheet definitions
- Update: `frontend/app.config.js` (splash backgroundColor)
- Update: Icon and splash screen assets if needed

## Labels
enhancement, ui/ux, design

## Effort Estimate
Medium (4-6 hours)