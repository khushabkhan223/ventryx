'use client';

import { useAuth } from '@/lib/auth';

export function useSubscription() {
    const { isPro, profile, refreshProfile } = useAuth();

    return {
        isPro,
        plan: isPro ? 'pro' : 'free',
        customerId: profile?.stripe_customer_id ?? null,
        refreshProfile,
    };
}
