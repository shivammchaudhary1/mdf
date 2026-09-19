# Group 8 — Member Sessions, Notifications & Admin UX

## Session/device management
- Member Settings now lists active sessions.
- Current session is clearly marked.
- Remembered sessions are labelled.
- New sessions store a privacy-safe device/browser label; raw IP/user-agent values remain unhashed nowhere new.
- Members can revoke another session.
- Revoking the current session clears cookies and returns to login.
- Members can sign out every device.
- Confirmation dialogs protect current-device and all-device sign-out actions.

## Notification cleanup
- Removed the member notification bell because V1 has no real member notification backend. This avoids a fake control.
- Existing email/opportunity preference switches remain because they are real stored settings.
- Admin activity notifications remain connected to real audit/dashboard activity.

## Admin UX cleanup
- Removed the non-functional “Add Member” form. Members continue to join through registration.
- Removed the admin top-bar global search control because it did not actually search the platform.
- Member management remains search/filter/review/verify/suspend focused.

## Toast system
- Rebuilt toasts into branded success/error/info/warning cards.
- Added clear status labels and visual accents.
- Added enter animation and a real bottom countdown/progress loader.
- Errors remain visible longer.
- Up to four recent toasts are stacked without flooding the UI.
- Reduced-motion preferences are respected through the existing global motion rule.

Group 9 remains Applications, Careers, Contact & Email Product Behavior.
