# React Native Component Generator

## 🎯 Purpose
Generate type-safe, well-structured React Native components following Will Counter project patterns.

## 📋 Template

Copy and customize this template before sending to Claude:

---

**ROLE**: You are a senior React Native developer creating components for the Will Counter mobile app. Generate production-ready, type-safe components following the project's established patterns.

**PROJECT CONTEXT**:
- **Framework**: React Native with TypeScript + Expo
- **State Management**: Redux Toolkit with RTK Query
- **Styling**: StyleSheet with responsive design
- **Navigation**: React Navigation v6
- **Authentication**: Auth0 integration
- **Theming**: Consistent color palette and typography

**ARCHITECTURE PATTERNS**:
- Component structure: `/frontend/src/components/{category}/{ComponentName}/`
- Hooks: `/frontend/src/hooks/`
- Types: `/frontend/src/types/`
- Utils: `/frontend/src/utils/`
- Store: `/frontend/src/store/slices/`

**EXISTING PATTERNS TO FOLLOW**:
```typescript
// Example component structure from project
export interface ComponentProps {
  // Props interface
}

export const ComponentName: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Component implementation
};

const styles = StyleSheet.create({
  // Styles
});
```

## COMPONENT SPECIFICATION

**Component Name**: [e.g., WillCounterButton, StatisticsChart, UserProfile]

**Component Type**: [Choose one]
- [ ] Screen Component (full screen)
- [ ] UI Component (reusable widget)
- [ ] Layout Component (container/wrapper)
- [ ] Form Component (input/form element)

**Component Purpose**: 
[Describe what this component does and where it's used]

**Props Required**:
```typescript
// List the props this component should accept
interface ComponentProps {
  // Define expected props
}
```

**State Requirements**:
- [ ] Local state only
- [ ] Redux state integration
- [ ] API data fetching
- [ ] Form state management

**Styling Requirements**:
- [ ] Responsive design (different screen sizes)
- [ ] Dark/light theme support
- [ ] Accessibility features
- [ ] Platform-specific styling (iOS/Android)

**Interactions**:
- [ ] Touch/press handling
- [ ] Gesture support
- [ ] Haptic feedback
- [ ] Sound feedback
- [ ] Animation/transitions

## SPECIFIC REQUIREMENTS

### For Will Counter Components:
- **Theming**: Use consistent colors (#007AFF primary, #FF3B30 secondary)
- **Typography**: San Francisco/Roboto system fonts
- **Spacing**: 16px base unit for consistent spacing
- **Accessibility**: WCAG AA compliance with VoiceOver/TalkBack support

### For Data Components:
- **Loading States**: Skeleton screens and loading indicators
- **Error States**: User-friendly error messages with retry options
- **Empty States**: Helpful empty state illustrations and CTAs
- **Offline Support**: Graceful degradation when offline

### For Interactive Components:
- **Touch Targets**: Minimum 44px touch target size
- **Visual Feedback**: Press states and hover effects
- **Haptic Feedback**: Appropriate haptic patterns for actions
- **Sound Effects**: Optional sound feedback for actions

## OUTPUT FORMAT

Please generate:

### 📁 File Structure
```
/frontend/src/components/{category}/{ComponentName}/
├── index.ts              # Barrel export
├── {ComponentName}.tsx   # Main component
├── {ComponentName}.test.tsx # Unit tests
├── styles.ts            # StyleSheet definitions
└── types.ts             # TypeScript interfaces
```

### 🧩 Component Code

#### Main Component (`{ComponentName}.tsx`)
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ComponentProps } from './types';
import { styles } from './styles';

export const ComponentName: React.FC<ComponentProps> = ({
  // Props destructuring
}) => {
  // Component implementation with:
  // - Proper TypeScript types
  // - Accessibility features
  // - Error boundaries
  // - Loading states
  // - Responsive design
};
```

#### Types (`types.ts`)
```typescript
export interface ComponentProps {
  // Well-documented prop interfaces
}

export interface ComponentState {
  // State type definitions if needed
}
```

#### Styles (`styles.ts`)
```typescript
import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  // Responsive, accessible styles
  // Following project design system
});
```

#### Tests (`{ComponentName}.test.tsx`)
```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  // Comprehensive test coverage
});
```

#### Barrel Export (`index.ts`)
```typescript
export { ComponentName } from './ComponentName';
export type { ComponentProps } from './types';
```

### 🎨 Design Considerations
- **Colors**: [Specify color usage and theme integration]
- **Typography**: [Font choices and hierarchy]
- **Spacing**: [Margin and padding patterns]
- **Animations**: [Transition and micro-interaction details]

### 📱 Platform Considerations
- **iOS Specific**: [iOS-specific features and styling]
- **Android Specific**: [Android-specific features and styling]
- **Responsive**: [How component adapts to different screen sizes]

### ♿ Accessibility Features
- **Screen Reader**: [VoiceOver/TalkBack support]
- **High Contrast**: [Support for high contrast themes]
- **Large Text**: [Dynamic type support]
- **Motor Accessibility**: [Touch target sizes and gesture alternatives]

### 🔧 Integration Points
```typescript
// Redux integration (if needed)
import { useAppSelector, useAppDispatch } from '../../store/hooks';

// Navigation integration (if needed)
import { useNavigation } from '@react-navigation/native';

// Auth integration (if needed)
import { useAuth0 } from 'react-native-auth0';
```

---

**CONSTRAINTS**:
- Must follow existing project TypeScript configurations
- Should integrate with current Redux store structure
- Must support both iOS and Android platforms
- Should maintain consistent styling with existing components
- Must include comprehensive accessibility support

## 🔄 Usage Examples

After generation, provide usage examples:

```typescript
// Basic usage
<ComponentName 
  prop1="value1"
  prop2={value2}
  onAction={handleAction}
/>

// Advanced usage with optional props
<ComponentName 
  prop1="value1"
  prop2={value2}
  style={customStyles}
  accessibilityLabel="Custom accessibility label"
  testID="component-test-id"
/>
```

## 📚 Related Documentation

- [Component Guidelines](/frontend/src/components/README.md) [if exists]
- [Design System](/docs/design-system.md) [if exists]
- [Redux Patterns](/frontend/src/store/README.md) [if exists]
- [Testing Guide](/frontend/__tests__/README.md) [if exists]

## 💡 Tips for Better Components

1. **Keep it Simple**: Single responsibility principle
2. **Make it Reusable**: Generic props and flexible styling
3. **Test Thoroughly**: Unit tests for all major functionality
4. **Document Well**: Clear prop descriptions and usage examples
5. **Follow Patterns**: Consistent with existing codebase
6. **Consider Performance**: Avoid unnecessary re-renders