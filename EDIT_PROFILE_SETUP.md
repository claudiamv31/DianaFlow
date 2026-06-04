# DianaFlow Edit Profile Functionality - Setup Guide

This document provides comprehensive instructions for implementing the Edit Profile functionality in DianaFlow.

## ✅ What's Included

### Backend (.NET 8 Web API)

- **ProfileController.cs** - 3 protected endpoints for profile management
  - `GET /api/profile` - Get current user's profile
  - `PUT /api/profile` - Update name, lastName, email
  - `POST /api/profile/upload-avatar` - Upload profile picture
  - `POST /api/profile/change-password` - Change password securely

- **ProfileService.cs** - Clean service layer with:
  - `IProfileService` - Profile operations
  - `IPasswordService` - Password hashing & verification (BCrypt)
  - Avatar file management with validation
  - Email uniqueness validation

- **DTOs** - Strong typing for requests/responses:
  - `UpdateProfileDto` - Profile update request
  - `ChangePasswordDto` - Password change request
  - `AvatarResponseDto` - Avatar upload response

- **UserProfile Model** - Extended with `AvatarUrl` field for avatar persistence

### Frontend (React + TanStack Query)

- **useProfileHooks.js** - Custom hooks for API calls:
  - `useGetProfile()` - Fetch current user profile
  - `useUpdateProfile()` - Mutation for profile updates
  - `useUploadAvatar()` - Mutation for avatar uploads
  - `useChangePassword()` - Mutation for password changes

- **EditProfileModal.jsx** - Full-featured modal component:
  - 3 tabbed sections: Profile, Avatar, Password
  - Form validation with error messages
  - Loading states & disabled buttons
  - Success handling with query invalidation

- **Updated Settings.jsx** - Connected modal to main settings page

- **Updated apiClient.jsx** - Added profile API methods

## 🛠️ Setup Instructions

### Backend Setup

#### 1. Install Required NuGet Package

```bash
dotnet add package BCrypt.Net-Next --version 4.0.3
```

#### 2. Create Database Migration

```bash
cd backend
dotnet ef migrations add AddAvatarUrlToUserProfile
dotnet ef database update
```

#### 3. Verify Service Registration

The Program.cs has been updated with:

```csharp
builder.Services.AddScoped<IPasswordService, PasswordService>();
builder.Services.AddScoped<IProfileService, ProfileService>();
app.UseStaticFiles(); // For serving avatars
```

#### 4. Create Avatars Directory

The application automatically creates `wwwroot/avatars/` on first avatar upload.

### Frontend Setup

#### 1. Verify Dependencies

Your project should have:

```json
{
  "@tanstack/react-query": "^5.x",
  "axios": "^1.x"
}
```

#### 2. All Files Created

The following files have been created/updated:

**New Files:**

- `frontend/src/hooks/useProfileHooks.js`
- `frontend/src/pages/Settings/EditProfileModal/EditProfileModal.jsx`

**Updated Files:**

- `frontend/src/pages/Settings/Settings.jsx`
- `frontend/src/api/apiClient.jsx`
- `backend/Modulos/Users/Models/UserProfile.cs`
- `backend/Modulos/Users/Controllers/ProfileController.cs`
- `backend/Modulos/Users/Services/ProfileService.cs`
- `backend/Modulos/Users/DTOs/UpdateProfileDto.cs`
- `backend/Modulos/Users/DTOs/ChangePasswordDto.cs`
- `backend/Modulos/Users/DTOs/AvatarResponseDto.cs`
- `backend/Program.cs`

## 🔐 Security Features

- ✅ JWT Authentication on all profile endpoints
- ✅ BCrypt password hashing (industry standard)
- ✅ Current password verification before password change
- ✅ File upload validation (size, type, extension)
- ✅ Email uniqueness validation
- ✅ Old avatar cleanup on new upload
- ✅ Password minimum 8 characters requirement
- ✅ New password must differ from current

## 📋 Form Validation

### Profile Details

- **Name**: Required, non-empty
- **Email**: Required, valid format, unique across users

### Avatar Upload

- **Formats**: JPG, JPEG, PNG, WebP
- **Max Size**: 5MB
- **Validation**: Server-side + client-side

### Password Change

- **Current Password**: Required, must match existing
- **New Password**: Min 8 characters, must differ from current
- **Confirm Password**: Must match new password

## 🚀 Usage

### User Flow

1. **User clicks "Edit Profile" or camera icon** → EditProfileModal opens
2. **Profile Tab** → Update name/email
3. **Avatar Tab** → Select and upload new profile picture
4. **Password Tab** → Change password securely
5. **On success** → Data refreshes, sensitive fields cleared

### API Endpoints

All endpoints require JWT Bearer token in Authorization header.

```bash
# Get profile
curl -H "Authorization: Bearer <token>" \
  http://localhost:5039/api/profile

# Update profile
curl -X PUT \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"John","lastName":"Doe","email":"john@example.com"}' \
  http://localhost:5039/api/profile

# Upload avatar
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -F "file=@avatar.jpg" \
  http://localhost:5039/api/profile/upload-avatar

# Change password
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"old123","newPassword":"new1234"}' \
  http://localhost:5039/api/profile/change-password
```

## 🎨 UI/UX Details

- **Material Design 3** tokens (matches your existing theme)
- **Responsive** - Works on mobile & desktop
- **Accessible** - Semantic HTML, ARIA labels
- **Loading States** - Disabled buttons, spinner icons
- **Error Handling** - User-friendly Spanish messages
- **Tab-based Navigation** - Organized sections

## 📝 Error Handling

All endpoints return meaningful error messages:

- Validation errors (400)
- Unauthorized errors (401)
- Not found errors (404)
- Server errors (500)

Frontend displays errors in red alert boxes with clear messaging.

## 🔄 Query Invalidation

After successful mutations, the profile query is automatically invalidated and refetched, ensuring:

- Updated name/email display
- Fresh avatar URL in header
- Consistent state across app

## 🧪 Testing Checklist

### Backend

- [ ] Run migrations successfully
- [ ] Test `/api/profile` GET (returns user data)
- [ ] Test PUT endpoint (updates profile)
- [ ] Test avatar upload with valid files
- [ ] Test avatar upload with invalid files (should reject)
- [ ] Test password change with correct current password
- [ ] Test password change with wrong current password
- [ ] Test email uniqueness validation

### Frontend

- [ ] Modal opens when clicking "Edit Profile"
- [ ] Modal opens when clicking "Change Password"
- [ ] Profile details load from backend
- [ ] Avatar preview works
- [ ] Form validation messages appear
- [ ] Password fields clear on success
- [ ] Avatar updates in header
- [ ] All tabs functional

## 📚 Architecture Notes

### Service Layer Pattern

- `IProfileService` - High-level profile operations
- `IPasswordService` - Password security operations
- Clean separation of concerns
- Easy to unit test
- Reusable across controllers

### React Query Integration

- Custom hooks for each operation type
- Automatic loading/error states
- Built-in caching
- Automatic refetch on demand
- TypeScript-ready (add types as needed)

### Error Recovery

- Password fields cleared after success
- Old form data restored if request fails
- User-friendly error messages
- Retry-friendly API design

## 🚨 Important Notes

1. **Database Migration**: Before first use, run the migration to add `AvatarUrl` column
2. **Static Files**: Ensure `wwwroot` directory exists and is accessible
3. **File Permissions**: App needs write permissions to `wwwroot/avatars/`
4. **CORS**: React app (localhost:3000) is already allowed in Program.cs
5. **Avatar URLs**: Include full base URL when displaying (http://localhost:5039/avatars/...)

## 🔧 Troubleshooting

### Avatar Not Saving

- Check `wwwroot/avatars/` directory exists and is writable
- Verify `app.UseStaticFiles()` is in Program.cs (it is!)
- Check file size isn't exceeding 5MB

### Password Change Not Working

- Verify current password is correct
- Check new password is 8+ characters
- Ensure new password differs from current

### Form Validation Not Showing

- Check browser console for errors
- Verify `useGetProfile` hook is properly imported
- Ensure JWT token exists in localStorage

## 📖 File Structure

```
backend/
├── Modulos/Users/
│   ├── Controllers/
│   │   ├── UsersController.cs (existing)
│   │   └── ProfileController.cs (NEW)
│   ├── Models/
│   │   └── UserProfile.cs (UPDATED - added AvatarUrl)
│   ├── DTOs/
│   │   ├── LoginDto.cs (existing)
│   │   ├── RegisterDto.cs (existing)
│   │   ├── UpdateProfileDto.cs (NEW)
│   │   ├── ChangePasswordDto.cs (NEW)
│   │   └── AvatarResponseDto.cs (NEW)
│   └── Services/
│       └── ProfileService.cs (NEW - includes IPasswordService, IProfileService)
├── Program.cs (UPDATED - added service registrations)
└── wwwroot/
    └── avatars/ (CREATED automatically)

frontend/
├── src/
│   ├── hooks/
│   │   └── useProfileHooks.js (NEW)
│   ├── pages/Settings/
│   │   ├── Settings.jsx (UPDATED)
│   │   └── EditProfileModal/
│   │       └── EditProfileModal.jsx (NEW)
│   └── api/
│       └── apiClient.jsx (UPDATED - added profile methods)
```

## 🎯 Next Steps

1. Apply database migration
2. Test all endpoints with Postman/cURL
3. Test frontend modal with live backend
4. Add toast notifications for success/error (optional)
5. Consider implementing avatar cropping (optional enhancement)

---

**Ready to use!** Follow the setup instructions above and your Edit Profile functionality will be production-ready. 🚀
