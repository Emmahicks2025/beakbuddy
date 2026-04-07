export type SubscriptionTier = 'monthly' | 'six_month' | 'yearly';

export interface SubscriptionProduct {
    iosId: string;
    androidId: string;
    tier: SubscriptionTier;
    displayName: string;
    price: string;
    duration: string;
    savings?: string;
    description: string;
}

export interface SubscriptionStatus {
    isActive: boolean;
    tier?: SubscriptionTier;
    expirationDate?: string;
    willRenew: boolean;
    isInTrialPeriod: boolean;
}

export const SUBSCRIPTION_TIERS: Record<string, SubscriptionProduct> = {
    monthly: {
        iosId: 'beakbuddy_monthly_499',
        androidId: 'parrot_monthly',
        tier: 'monthly',
        displayName: 'Monthly',
        price: '$3.99',
        duration: '/ month',
        description: 'Full access'
    },
    six_month: {
        iosId: 'beakbuddy_3month_1100',
        androidId: 'parrot_six_month',
        tier: 'six_month',
        displayName: '3 Months',
        price: '$10.99',
        duration: '/ 3 months',
        savings: 'Save 30%',
        description: 'Popular choice'
    },
    yearly: {
        iosId: 'cakbuddy_yearly_2499',
        androidId: 'parrot_yearly',
        tier: 'yearly',
        displayName: 'Yearly',
        price: '$39.99',
        duration: '/ year',
        savings: 'Save 33%',
        description: 'Best value'
    }
};

