# Wellio Health - Testing Checklist

## Critical User Flows

### Authentication
- [ ] Email signup with valid email
- [ ] Email signup with invalid email (error handling)
- [ ] Login with correct credentials
- [ ] Login with incorrect credentials (error handling)
- [ ] Password reset flow
- [ ] 2FA setup and verification
- [ ] Backup codes generation and usage
- [ ] Session timeout after 30 minutes inactivity
- [ ] Logout functionality

### Premium/Subscription
- [ ] Free user sees upgrade prompts on premium features
- [ ] SubscriptionGate blocks access correctly
- [ ] VIP badge displays for premium users
- [ ] Add-ons can be added to cart
- [ ] Cart persists across navigation
- [ ] Checkout dialog opens correctly

### Fitness Tracking
- [ ] Log workout with all fields
- [ ] Edit existing workout
- [ ] Delete workout
- [ ] Weight logging and history chart
- [ ] Step count logging
- [ ] Habit creation and completion
- [ ] Interval timer creation and playback

### Nutrition
- [ ] Log food entry manually
- [ ] AI food analysis (when API key available)
- [ ] Receipt scanner (when API key available)
- [ ] Meal plan creation
- [ ] Food log history displays correctly

### Social Features
- [ ] Create post with text
- [ ] Create post with image
- [ ] Like/unlike post
- [ ] Comment on post
- [ ] Follow/unfollow user
- [ ] Block user
- [ ] Direct messaging
- [ ] Message encryption indicator

### Medical Records
- [ ] Re-authentication gate works
- [ ] Upload medical record
- [ ] View encrypted records
- [ ] Medical audit log captures access

### Recovery Hub
- [ ] Log recovery session
- [ ] View recovery history
- [ ] Statistics calculate correctly

---

## Mobile Responsiveness

### Navigation
- [ ] Bottom navigation visible on mobile
- [ ] Sidebar hidden on mobile
- [ ] All menu items accessible
- [ ] Back navigation works correctly

### Forms
- [ ] All inputs are touch-friendly (44px minimum)
- [ ] Keyboards don't obscure inputs
- [ ] Form validation messages visible
- [ ] Submit buttons accessible

### Content
- [ ] Images scale correctly
- [ ] Text readable without zooming
- [ ] Charts/graphs render on mobile
- [ ] Modals/dialogs fit screen

---

## Browser Compatibility

### Desktop
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile
- [ ] iOS Safari
- [ ] Chrome Android
- [ ] Samsung Internet

---

## Accessibility

- [ ] All images have alt text
- [ ] All interactive elements have aria-labels
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA
- [ ] Screen reader compatibility

---

## Performance

- [ ] Lighthouse Performance score > 90
- [ ] Lighthouse Accessibility score > 90
- [ ] Lighthouse Best Practices score > 90
- [ ] Lighthouse SEO score > 90
- [ ] No console errors in production
- [ ] Images lazy load correctly
- [ ] Bundle size reasonable (< 500KB initial)

---

## Security

- [ ] CSP headers applied
- [ ] No sensitive data in console logs
- [ ] Session timeout working
- [ ] Anomaly detection logging
- [ ] RLS policies enforced
- [ ] Medical data encrypted

---

## i18n (Test in Spanish + 2 other languages)

- [ ] All UI text translates
- [ ] Dates format correctly per locale
- [ ] Numbers format correctly per locale
- [ ] No missing translation warnings in console
- [ ] RTL layout works (Arabic)
