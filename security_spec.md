# Security Specification - JobAI Japan

## Data Invariants
1. A `UserProfile` can only be created or modified by the user who owns it (document ID == auth.uid).
2. An `Application` must have a `userId` that matches the authenticated user.
3. `Jobs` are read-only for users (only a system admin, if implemented, could write).
4. `Application` status must be one of: "Applied", "Interview", "Rejected", "Offer", "Saved".
5. Timestamps (`createdAt`, `updatedAt`) must be validated against `request.time`.

## The Dirty Dozen Payloads (Rejection Targets)
1. **Identity Spoofing**: Creating a `UserProfile` with a document ID of another user.
2. **Identity Poisoning**: Injecting a 2MB string as a `userId` in an `Application`.
3. **Privilege Escalation**: Authenticated user trying to update another user's `shokumu` document.
4. **State Shortcutting**: Updating an `Application` status to "Offer" without it ever being "Interview". (Wait, status transitions aren't strictly linear here, but we'll enforce key ownership).
5. **Shadow Field Injection**: Adding `isVerified: true` to a `UserProfile` during update.
6. **Immutable Field Tampering**: Changing the `createdAt` or `userId` of an existing `Application`.
7. **PII Leakage**: A user trying to list all `users/` to find email addresses.
8. **Resource Exhaustion**: Sending an array of 5,000 skills in `UserProfile`.
9. **Referential Orphan**: Creating an `Application` for a `jobId` that doesn't exist (if checked).
10. **Timestamp Fraud**: Setting `appliedAt` to a future date instead of `request.time`.
11. **Blanket Read Attack**: Querying `applications` without a `userId` filter.
12. **Method Bypass**: Trying to delete a `UserProfile` (if delete is forbidden).

## Test Runner (Simplified)
- `tests/firestore.rules.test.ts` will verify these rejections.
