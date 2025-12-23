# Implement user account deletion functionality

## Description
Add the ability for users to permanently delete their account and all associated data, complying with privacy regulations and user rights.

## Current State
- Settings screen has logout functionality
- No current user deletion options
- User data stored in Supabase with Auth0 authentication
- Auth0 user management exists but deletion not exposed

## Requirements
- Add "Delete Account" option in Settings screen
- Implement secure account deletion flow
- Delete all user data from database
- Remove user from Auth0
- Provide clear warnings and confirmation flow
- Ensure compliance with GDPR/privacy regulations

## User Flow
1. User goes to Settings
2. Finds "Delete Account" option (clearly marked as destructive)
3. Sees clear warning about data loss
4. Confirms identity (if needed)
5. Confirms deletion with explicit typing or multiple confirmations
6. Account and data are permanently deleted
7. User is logged out and returned to login screen

## Acceptance Criteria
- [ ] "Delete Account" option added to Settings screen
- [ ] Multi-step confirmation process prevents accidental deletion
- [ ] All user data is removed from Supabase database
- [ ] User is removed from Auth0
- [ ] Proper error handling and user feedback
- [ ] Loading states during deletion process
- [ ] User is logged out after successful deletion

## Technical Requirements
- Update SettingsScreen with delete account UI
- Create API endpoint for account deletion
- Implement Auth0 user deletion via Management API
- Create database cleanup procedures (all user-related records)
- Add proper error handling and rollback mechanisms
- Implement secure confirmation flow

## Files to be Modified
- `frontend/src/components/settings/SettingsScreen.tsx`
- `frontend/src/services/api.ts` (add deleteAccount method)
- `api/` - Add account deletion endpoint
- Database schema updates if needed for cascading deletes

## Security Considerations
- Require recent authentication for deletion
- Implement confirmation delays or cooloff periods
- Log deletion events for audit purposes
- Ensure complete data removal

## Labels
enhancement, security, privacy, auth, breaking-change

## Effort Estimate
Large (10-15 hours)