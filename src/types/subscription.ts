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
        id: 'beakbuddy_monthly_399',
        tier: 'monthly',
        displayName: 'Monthly',
        price: '$3.99',
        duration: '/ month',
        description: 'Full access + 14-day Free Trial'
    },
    six_month: {
        id: 'beakbuddy_6month_1699',
        tier: 'six_month',
        displayName: '6 Months',
        price: '$16.99',
        duration: '/ 6 months',
        savings: 'Save 29%',
        description: 'Popular choice + 14-day Free Trial'
    },
    yearly: {
        id: 'beakbuddy_yearly_3399',
        tier: 'yearly',
        displayName: 'Yearly',
        price: '$33.99',
        duration: '/ year',
        savings: 'Save 29%',
        description: 'Best value + 14-day Free Trial'
    }
};

