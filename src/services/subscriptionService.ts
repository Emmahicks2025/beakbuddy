import Purchases, {
    initConnection,
    getAvailablePurchases,
    getSubscriptions,
    requestSubscription,
    endConnection,
    Subscription
} from 'react-native-iap';
import { Platform } from 'react-native';
import { SubscriptionStatus, SUBSCRIPTION_TIERS, SubscriptionTier } from '../types/subscription';

const itemSkus = Platform.select({
    android: [
        SUBSCRIPTION_TIERS.monthly.id,
        SUBSCRIPTION_TIERS.six_month.id,
        SUBSCRIPTION_TIERS.yearly.id,
    ],
    default: [],
});

class SubscriptionService {
    private isInitialized = false;

    async initialize(): Promise<void> {
        if (this.isInitialized) return;

        try {
            await initConnection();
            this.isInitialized = true;
            console.log('SubscriptionService: Initialized with react-native-iap v12');
        } catch (error) {
            console.error('SubscriptionService: Initialization failed', error);
        }
    }

    async getOfferings(): Promise<{ availablePackages: any[] }> {
        try {
            if (!this.isInitialized) await this.initialize();

            // console.log('SubscriptionService: Fetching products for SKUs', itemSkus);
            const subscriptions = await getSubscriptions({ skus: itemSkus as string[] });

            // console.log('SubscriptionService: Got products', subscriptions.length);

            const availablePackages = subscriptions.map((sub: Subscription) => {
                const tier = Object.values(SUBSCRIPTION_TIERS).find(t => t.id === sub.productId);
                return {
                    identifier: sub.productId,
                    product: {
                        title: sub.title.split(' (')[0],
                        priceString: (sub as any).localizedPrice || (sub as any).price || tier?.price || '$3.99',
                        description: sub.description,
                    },
                    iapProduct: sub
                };
            });

            return { availablePackages };
        } catch (error) {
            console.error('SubscriptionService: Failed to get subscriptions', error);
            return { availablePackages: [] };
        }
    }

    async purchaseSubscription(pkg: any): Promise<{ success: boolean; userCancelled: boolean }> {
        try {
            if (!this.isInitialized) await this.initialize();

            const sku = pkg.identifier;
            // console.log('SubscriptionService: Requesting purchase for', sku);

            // v12 style request
            // v12 style request for Android requires offerToken
            // Since we can't easily get the offer token here without passing the full object, 
            // we should rely on the UI passing the 'iapProduct' object which contains specific offers.

            // Fallback if we only have the SKU string (might fail on v12 w/o offer token)
            let subscriptionOffers;

            if (pkg.iapProduct?.subscriptionOfferDetails?.length > 0) {
                // Use the first offer token as default (usually the base plan or trial)
                subscriptionOffers = [{
                    sku: pkg.identifier,
                    offerToken: pkg.iapProduct.subscriptionOfferDetails[0].offerToken
                }];
            }

            await requestSubscription({
                sku,
                ...(subscriptionOffers && { subscriptionOffers }),
            });

            return { success: true, userCancelled: false };
        } catch (error: any) {
            console.error('SubscriptionService: Purchase error', error);
            const isCancelled = error?.code === 'E_USER_CANCELLED';
            return { success: false, userCancelled: isCancelled };
        }
    }

    async getSubscriptionStatus(): Promise<SubscriptionStatus> {
        try {
            if (!this.isInitialized) await this.initialize();

            const purchases = await getAvailablePurchases();
            console.log('SubscriptionService: Available purchases', purchases?.length || 0);

            if (!purchases || purchases.length === 0) {
                return { isActive: false, willRenew: false, isInTrialPeriod: false };
            }

            const activeSub = purchases.find((p: any) => itemSkus?.includes(p.productId));

            if (activeSub) {
                const tier: SubscriptionTier = activeSub.productId.includes('yearly') ? 'yearly' :
                    activeSub.productId.includes('6month') ? 'six_month' : 'monthly';

                return {
                    isActive: true,
                    tier,
                    expirationDate: activeSub.transactionDate ? new Date(activeSub.transactionDate).toISOString() : undefined,
                    willRenew: true,
                    isInTrialPeriod: false
                };
            }

            return {
                isActive: false,
                willRenew: false,
                isInTrialPeriod: false
            };
        } catch (error) {
            console.error('SubscriptionService: Failed to get status', error);
            return {
                isActive: false,
                willRenew: false,
                isInTrialPeriod: false
            };
        }
    }

    async restorePurchases(): Promise<boolean> {
        try {
            if (!this.isInitialized) await this.initialize();
            await getAvailablePurchases();
            return true;
        } catch (error) {
            console.error('SubscriptionService: Failed to restore', error);
            return false;
        }
    }

    async hasActiveSubscription(): Promise<boolean> {
        const status = await this.getSubscriptionStatus();
        return status.isActive;
    }

    async endConnection(): Promise<void> {
        if (this.isInitialized) {
            await endConnection();
            this.isInitialized = false;
        }
    }
}

export default new SubscriptionService();
