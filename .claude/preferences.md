# Claude Code Preferences for Will Counter

## Development Preferences

### Code Style & Standards
- **Language**: Prefer TypeScript for frontend, Kotlin for backend
- **Components**: Use functional React components with hooks
- **State Management**: Use Redux Toolkit with typed selectors
- **Error Handling**: Always use try/catch blocks for async operations
- **Testing**: Write tests for all new components and critical logic
- **Comments**: Only add comments for complex business logic, not obvious code

### File Organization
- **Components**: Group by feature in `/src/components/[feature]/`
- **Tests**: Mirror source structure in `__tests__/`
- **Utilities**: Place shared utilities in `/src/utils/`
- **Types**: Define interfaces/types close to where they're used
- **Constants**: Use SCREAMING_SNAKE_CASE for constants

### Development Workflow
- **Environment**: Always check environment variables are set before debugging
- **Database**: Use Supabase REST API directly (frontend) or through backend
- **Authentication**: Test auth flows in incognito/private browser windows
- **Mobile Testing**: Test on both iOS and Android simulators when possible
- **API Testing**: Use Postman/Insomnia for backend endpoint testing

### Performance Guidelines
- **React**: Use useMemo/useCallback for expensive computations
- **Database**: Batch database operations when possible
- **Images**: Optimize images and use appropriate formats
- **Bundle Size**: Monitor bundle size and lazy load when appropriate

## Claude Code Specific Settings

### Preferred Tools & Commands
```bash
# Development server startup
npm start                    # Frontend (Expo)
./gradlew run               # Backend (Kotlin)

# Testing
npm test                    # Frontend tests
./gradlew test             # Backend tests

# Code quality
npm run lint               # Frontend linting
```

### Common Debugging Patterns
1. **Auth Issues**: Check Auth0 dashboard and token expiration
2. **Database Issues**: Verify Supabase connection and RLS policies
3. **Build Issues**: Clear node_modules and .expo cache
4. **Test Issues**: Check mocks for Expo modules

### Environment Context
- **Development**: Local servers with hot reload
- **Testing**: Mocked external services (Auth0, Supabase)
- **Production**: EAS Build with real services

## Project-Specific Notes

### Architecture Decisions
- **Direct Supabase Access**: Frontend bypasses backend for now (simpler development)
- **Auth0 Integration**: JWT tokens stored in secure storage
- **Redux Structure**: Feature-based slices (auth, user, willCounter)
- **Navigation**: React Navigation with typed parameters

### Security Considerations
- **Environment Variables**: Never commit actual secrets
- **Service Role Key**: Only use in backend, never frontend
- **User Data**: Validate all user inputs before database operations
- **Tokens**: Implement proper token refresh logic

### Future Considerations
- **Backend API**: Eventually route all data through backend
- **Statistics**: Implement comprehensive analytics
- **Notifications**: Add push notifications for reminders
- **Offline Support**: Add offline data synchronization