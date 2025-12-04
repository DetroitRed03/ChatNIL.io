# Navigation Redesign - Phase 4: Advanced Features

## Overview
Phase 4 focuses on enhancing the navigation experience with advanced features including keyboard shortcuts, recent pages tracking, resizable sidebar, and dark mode support.

## Goals
1. Improve power user productivity with keyboard shortcuts
2. Enhance navigation with recent pages history
3. Allow users to customize sidebar width
4. Provide dark mode for better accessibility
5. Make navigation more intuitive and efficient

## Features to Implement

### 1. Keyboard Shortcuts System
**Priority:** High
**Complexity:** Medium

#### Shortcuts to Implement:
- `Cmd+K` (Mac) / `Ctrl+K` (Windows/Linux) - Open global search
- `Cmd+B` (Mac) / `Ctrl+B` (Windows/Linux) - Toggle sidebar
- `Cmd+/` (Mac) / `Ctrl+/` (Windows/Linux) - Show keyboard shortcuts help
- `Cmd+N` (Mac) / `Ctrl+N` (Windows/Linux) - New chat
- `Esc` - Close modals/search
- `1-7` (with Cmd/Ctrl) - Quick navigate to pages

#### Technical Approach:
```tsx
// Create custom hook: hooks/useKeyboardShortcuts.ts
// Features:
// - Cross-platform detection (Mac vs Windows/Linux)
// - Event delegation for performance
// - Configurable shortcut map
// - Context-aware shortcuts (disable in input fields)
```

#### Files to Create/Modify:
- `hooks/useKeyboardShortcuts.ts` - Main keyboard shortcuts hook
- `contexts/KeyboardShortcutsContext.tsx` - Global shortcuts provider
- `components/navigation/KeyboardShortcutsModal.tsx` - Help modal
- `app/layout.tsx` - Add shortcuts provider

### 2. Recent Pages History
**Priority:** High
**Complexity:** Low

#### Features:
- Track last 5-10 visited pages
- Display in a dropdown (accessible via keyboard)
- Persist across sessions (localStorage)
- Smart ordering (most recently visited first)
- Exclude duplicate consecutive visits

#### Technical Approach:
```tsx
// Create custom hook: hooks/usePageHistory.ts
// Store in navigation-store.ts alongside other nav state
// Features:
// - Auto-track navigation changes
// - LocalStorage persistence
// - Max history limit
// - Quick navigation dropdown
```

#### Files to Create/Modify:
- `hooks/usePageHistory.ts` - Page history tracking hook
- `stores/navigation-store.ts` - Add history state
- `components/navigation/Header/RecentPages.tsx` - History dropdown
- `components/navigation/Header/index.tsx` - Integrate dropdown

### 3. Resizable Sidebar
**Priority:** Medium
**Complexity:** Medium

#### Features:
- Drag handle on sidebar edge
- Min width: 200px, Max width: 400px
- Smooth resize animation
- Persist width preference
- Snap to collapsed state

#### Technical Approach:
```tsx
// Create custom hook: hooks/useSidebarResize.ts
// Features:
// - Mouse drag detection
// - Boundary constraints
// - LocalStorage persistence
// - Smooth CSS transitions
```

#### Files to Create/Modify:
- `hooks/useSidebarResize.ts` - Resize logic hook
- `components/navigation/Sidebar/ResizeHandle.tsx` - Drag handle component
- `components/navigation/Sidebar/index.tsx` - Integrate resize
- `stores/navigation-store.ts` - Add width state

### 4. Dark Mode Support
**Priority:** Medium
**Complexity:** High

#### Features:
- Toggle in user profile menu
- System preference detection
- Persist preference
- Smooth theme transition
- Update all navigation components

#### Technical Approach:
```tsx
// Create theme system: lib/theme.ts
// Use CSS variables for easy switching
// Features:
// - Detect system preference
// - LocalStorage persistence
// - CSS variable updates
// - Smooth transitions
```

#### Files to Create/Modify:
- `lib/theme.ts` - Theme management utilities
- `contexts/ThemeContext.tsx` - Theme provider
- `components/navigation/Header/ThemeToggle.tsx` - Toggle button
- `app/globals.css` - Add dark mode CSS variables
- `tailwind.config.js` - Dark mode configuration

### 5. Keyboard Shortcuts Help Modal
**Priority:** Low
**Complexity:** Low

#### Features:
- Accessible via `Cmd+/` or `?` key
- Categorized shortcuts list
- Search within shortcuts
- Copy shortcut to clipboard
- Platform-specific display

#### Technical Approach:
```tsx
// Component: KeyboardShortcutsModal.tsx
// Features:
// - Modal with shortcuts list
// - Categorization (Navigation, Chat, General)
// - Search functionality
// - Platform detection for display
```

#### Files to Create:
- `components/navigation/KeyboardShortcutsModal.tsx` - Help modal
- `components/navigation/ShortcutBadge.tsx` - Visual shortcut display

## Implementation Order

### Week 1: Foundation
1. ✅ Set up keyboard shortcuts system
2. ✅ Implement basic shortcuts (search, sidebar toggle)
3. ✅ Create keyboard shortcuts context
4. ✅ Add shortcuts help modal

### Week 2: History & Resize
1. ✅ Implement page history tracking
2. ✅ Create recent pages dropdown
3. ✅ Add sidebar resize functionality
4. ✅ Test resize with different screen sizes

### Week 3: Dark Mode
1. ✅ Set up theme context and system
2. ✅ Create dark mode CSS variables
3. ✅ Update all navigation components
4. ✅ Add theme toggle button
5. ✅ Test theme transitions

### Week 4: Polish & Testing
1. ✅ Add smooth animations
2. ✅ Test all features together
3. ✅ Fix edge cases
4. ✅ Performance optimization
5. ✅ Documentation

## Technical Considerations

### Performance
- Use debouncing for resize operations
- Memoize expensive keyboard shortcut checks
- Lazy load help modal
- Use CSS transforms for smooth animations

### Accessibility
- Ensure keyboard shortcuts don't conflict with screen readers
- Provide alternative ways to access all features
- Test with keyboard-only navigation
- Add ARIA labels for new interactive elements

### Browser Compatibility
- Test keyboard shortcuts across browsers
- Ensure localStorage works consistently
- Handle resize on mobile (disable or adapt)
- Test dark mode on different displays

### State Management
- Use Zustand for sidebar width state
- LocalStorage for persistence
- Context for keyboard shortcuts registration
- Minimize re-renders with proper memoization

## Success Metrics

### User Experience
- [ ] All keyboard shortcuts work reliably
- [ ] Sidebar resize feels smooth and responsive
- [ ] Recent pages accurately tracks navigation
- [ ] Dark mode applies consistently
- [ ] No performance degradation

### Code Quality
- [ ] All new code has proper TypeScript types
- [ ] Components are properly tested
- [ ] No memory leaks in event listeners
- [ ] Proper cleanup on unmount
- [ ] Following existing code patterns

### Documentation
- [ ] All features documented
- [ ] Keyboard shortcuts listed in help modal
- [ ] Code comments for complex logic
- [ ] README updated with new features

## Files Structure

```
src/
├── hooks/
│   ├── useKeyboardShortcuts.ts    (NEW)
│   ├── usePageHistory.ts          (NEW)
│   └── useSidebarResize.ts        (NEW)
├── contexts/
│   ├── KeyboardShortcutsContext.tsx (NEW)
│   └── ThemeContext.tsx           (NEW)
├── components/navigation/
│   ├── KeyboardShortcutsModal.tsx (NEW)
│   ├── ShortcutBadge.tsx          (NEW)
│   ├── Header/
│   │   ├── RecentPages.tsx        (NEW)
│   │   └── ThemeToggle.tsx        (NEW)
│   └── Sidebar/
│       └── ResizeHandle.tsx       (NEW)
├── lib/
│   └── theme.ts                   (NEW)
└── stores/
    └── navigation-store.ts        (MODIFY)
```

## Risk Assessment

### Low Risk
- Keyboard shortcuts help modal
- Recent pages history
- Theme toggle button

### Medium Risk
- Keyboard shortcuts system (event handling)
- Page history tracking (routing integration)

### High Risk
- Sidebar resize (performance concerns)
- Dark mode (extensive CSS changes)

## Rollback Plan

Each feature will be implemented behind a feature flag in navigation-store:
```tsx
interface NavigationStore {
  features: {
    keyboardShortcuts: boolean;
    pageHistory: boolean;
    resizableSidebar: boolean;
    darkMode: boolean;
  };
}
```

This allows disabling features if issues arise without rollback.

## Next Steps

1. Begin with keyboard shortcuts system (foundation)
2. Implement basic shortcuts first
3. Add help modal for discoverability
4. Move to page history (simpler feature)
5. Tackle sidebar resize
6. Finally implement dark mode (most complex)

Let's start! 🚀
