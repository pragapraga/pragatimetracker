# TimeTracker - Development Progress Log

## Overview
A React-based time tracking web application that helps users split their day into segments and track how they spend time against their goals.

---

## Version History

### v1.2.0 - Material Design (Current)

#### UI/UX Overhaul
- **Material UI Integration**: Complete rewrite using MUI component library
  - MUI AppBar and Drawer for navigation
  - MUI Cards, Tables, Buttons, TextFields, Dialogs
  - MUI Snackbar for notifications (replaced custom Toast)
  - MUI Icons throughout the app
- **Improved Dark Mode**: MUI ThemeProvider with proper dark/light theme switching
- **Better Responsiveness**: MUI breakpoints for consistent mobile experience
- **Cleaner Codebase**: Removed custom CSS files in favor of MUI sx prop

---

### v1.1.0 - Dark Mode & Templates

#### New Features

**Dark Mode**
- Toggle between light and dark themes
- Theme preference saved to localStorage
- Smooth transition between themes

**Time Slot Templates**
- Save current day's configuration as a reusable template
- Templates page to view and manage saved templates
- Apply templates to any day with one click
- Template preview showing time slots and activities
- Confirmation dialog before applying (prevents data loss)

---

### v1.0.0 - Initial Release

#### Core Features

**Time Slot Tracking**
- Split day into equal segments based on hours input (e.g., 8 hours = 3 segments)
- Handles edge cases for non-divisible hours (creates partial final segment)
- Activity text input for each time slot
- Goal dropdown selector for each slot
- Date picker to view/edit entries for past dates
- Confirmation dialog before recreating segments (prevents accidental data loss)

**Goals Management**
- Dedicated Goals page for creating/managing goals
- Goals appear in time slot dropdown selectors
- Add and delete goals with visual feedback

**Navigation & Layout**
- Collapsible sidebar navigation
- Responsive header for mobile devices
- Footer component
- React Router for page navigation

**User Interface**
- Responsive design (mobile-friendly)
- Table view on desktop, card layout on mobile
- Toast notifications for save confirmations (centered)
- Loading states for data fetching
- Empty states with helpful messages

**Authentication**
- Google Sign-In via Firebase Authentication
- Protected routes (redirect to login if not authenticated)
- User profile display in sidebar
- Logout functionality

**Data Persistence**
- Cloud sync via Firebase Firestore
- Manual save with "Save" button (no auto-save)
- Real-time data subscription
- User-specific data isolation (security rules)

**Deployment**
- Firebase Hosting at https://praga-timetracker.web.app
- Firestore security rules deployed
- GitHub repository at https://github.com/pragapraga/pragatimetracker

---

## Technical Stack

- **Frontend**: React 18 + Vite 5
- **UI Library**: Material UI (MUI) v5
- **Routing**: React Router v6
- **Authentication**: Firebase Auth (Google Provider)
- **Database**: Firebase Firestore
- **Hosting**: Firebase Hosting

---

## File Structure

```
timetracker/
├── src/
│   ├── components/
│   │   ├── Layout.jsx        # MUI AppBar + Drawer layout
│   │   └── ProtectedRoute.jsx # Auth guard
│   ├── context/
│   │   ├── AuthContext.jsx   # Auth state management
│   │   └── ThemeContext.jsx  # MUI theme + dark mode
│   ├── pages/
│   │   ├── Goals.jsx         # Goals management (MUI)
│   │   ├── Login.jsx         # Login page (MUI)
│   │   ├── Templates.jsx     # Templates management (MUI)
│   │   └── TimeTracker.jsx   # Main time tracking (MUI)
│   ├── services/
│   │   └── firestore.js      # Firestore CRUD operations
│   ├── App.jsx               # Root component
│   ├── firebase.js           # Firebase configuration
│   └── main.jsx              # Entry point
├── firebase.json             # Firebase config
├── firestore.rules           # Firestore security rules
├── .firebaserc               # Firebase project config
└── package.json
```

---

## Development Notes

### Issues Resolved

1. **Vite Node.js Compatibility**
   - Issue: Vite 6 required Node 20.19+, user had 20.9.0
   - Fix: Downgraded to Vite 5

2. **Firebase CLI Permissions**
   - Issue: Global npm install failed
   - Fix: Installed firebase-tools locally as dev dependency

3. **Firestore Permissions**
   - Issue: "Missing or insufficient permissions" error
   - Fix: Created and deployed proper security rules

4. **Auto-save Felt Buggy**
   - Issue: Auto-save with debounce felt unreliable
   - Fix: Changed to manual save with explicit "Save" button

5. **Mobile Sidebar Logout**
   - Issue: Logout button not visible in portrait mode
   - Fix: Added overflow-y: auto and dynamic viewport height

---

## Future Ideas (Backlog)

- [ ] Weekly/monthly summary views
- [ ] Goal progress tracking/analytics
- [ ] Export data to CSV
- [x] Dark mode
- [x] Recurring time slot templates
- [ ] Time spent per goal statistics
- [ ] Offline support with sync

---

## Commands Reference

```bash
# Development
npm run dev

# Build
npm run build

# Deploy to Firebase
npx firebase deploy

# Deploy only hosting
npx firebase deploy --only hosting

# Deploy only Firestore rules
npx firebase deploy --only firestore:rules
```
