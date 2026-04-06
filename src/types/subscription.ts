export type SubscriptionTier = 'monthly' | 'six_month' | 'yearly';

export interface SubscriptionProduct {
    id: string;
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
        id: 'parrot_monthly',
        tier: 'monthly',
        displayName: 'Monthly',
        price: '$3.99',
        duration: '/ month',
        description: 'Full access'
    },
    six_month: {
        id: 'parrot_six_month',
        tier: 'six_month',
        displayName: '6 Months',
        price: '$19.99',
        duration: '/ 6 months',
        savings: 'Save 30%',
        description: 'Popular choice'
    },
    yearly: {
        id: 'parrot_yearly',
        tier: 'yearly',
        displayName: 'Yearly',
        price: '$39.99',
        duration: '/ year',
        savings: 'Save 33%',
        description: 'Best value'
    }
};

