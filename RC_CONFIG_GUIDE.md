# RevenueCat Configuration Guide for BeakBuddy

To make the Paywall template work with your app, you need to match these specific IDs from your code into the RevenueCat dashboard.

## 1. Entitlement Configuration
In RevenueCat, go to **Product catalog** -> **Entitlements**.
- **Entitlement ID**: Must be exactly `pro`
- **Description**: BeakBuddy Pro Access

> [!IMPORTANT]
> Your code (in `subscriptionService.ts`) specifically looks for the entitlement with ID `pro`. If this doesn't match, the app won't recognize active subscriptions.

## 2. Product & Package Mapping
In **Product catalog** -> **Offerings**, select your "Default" offering and ensure these packages are correctly linked:

| Package Type | Apple Product ID | Code Mapping |
| :--- | :--- | :--- |
| **$rc_monthly** | `beakbuddy_monthly_499` | Monthly Plan |
| **$rc_yearly** | `beakbuddy_yearly_2499` | Yearly Plan |

> [!TIP]
> Make sure the **Offering** containing these packages is set as the **"Current"** offering in RevenueCat, as the app is programmed to pull the current paywall.

## 3. Paywall Builder Settings (Your Screenshot)
In the Paywall Editor shown in your screenshot:
1. **Axis & Alignment**: Use "Vertical" stack (default).
2. **Carousel/Stack**: Ensure the "Annual" and "Monthly" rows are pulling from the **Packages** you created in Step 2.
3. **App Logic**:
    *   **Success handling**: The app is already listening for the purchase. If a user buys, `presentPaywall()` will finish, and the app will refresh the status.
    *   **Restore button**: Your template already has a "Restore purchases" button at the bottom. RevenueCat handles this automatically!

## Summary of Technical IDs
If you need to check these in the code later:
- **Entitlement ID**: `src/services/subscriptionService.ts:L115`
- **Monthly ID**: `src/types/subscription.ts:L23`
- **Yearly ID**: `src/types/subscription.ts:L49`
