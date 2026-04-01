import { SubscriptionStatus } from '../types/subscription';

// Mock Subscription Service for Web
// RevenueCat (react-native-purchases) does not support web.
// We use this no-op implementation to prevent build errors and runtime crashes on web.

class SubscriptionServiceWeb {
    private isInitialized = false;

    async initialize(userId?: string): Promise<void> {
        console.log('🌐 [Web] SubscriptionService: Initialized (Mock)');
        this.isInitialized = true;
    }

    async getOfferings(): Promise<any> {
        console.log('🌐 [Web] SubscriptionService: getOfferings (Mock)');
        return null; // Return empty offerings
    }

    async purchaseSubscription(productId: string): Promise<{ customerInfo: any; userCancelled: boolean }> {
        console.log('🌐 [Web] SubscriptionService: purchaseSubscription (Mock)', productId);
        alert("In-app purchases are not supported on the web version.");
        return { customerInfo: null, userCancelled: true };
    }

    async getSubscriptionStatus(): Promise<SubscriptionStatus> {
        // Default to free tier on web for now
        // You could add a debug toggle here if you want to test Pro features on web
        return {
            isActive: false, // Set to true to test Pro features on web
            willRenew: false,
            isInTrialPeriod: false
        };
    }

    async restorePurchases(): Promise<any> {
        console.log('🌐 [Web] SubscriptionService: restorePurchases (Mock)');
        alert("Restore purchases is not supported on the web version.");
        return { entitlements: { active: {} } };
    }

    async hasActiveSubscription(): Promise<boolean> {
        const status = await this.getSubscriptionStatus();
        return status.isActive;
    }

    async presentPaywall(): Promise<void> {
        console.log('🌐 [Web] SubscriptionService: presentPaywall (Mock)');
        alert("Subscriptions are managed via the mobile app.");
    }
}

export default new SubscriptionServiceWeb();
