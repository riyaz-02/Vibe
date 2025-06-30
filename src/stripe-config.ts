export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  mode: 'payment' | 'subscription';
  features?: string[];
  popular?: boolean;
  stripePriceObject?: any;
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_SaoWpLi2qxp6aq',
    priceId: 'price_1RfctaG3rwHz1Z4EDF3q4K0l',
    name: 'P7',
    description: 'Ultimate enterprise subscription with premium features and unlimited access',
    price: 10000.00,
    currency: 'inr',
    mode: 'subscription',
    popular: true,
    features: [
      'Unlimited loan requests and funding',
      'Premium AI risk assessment',
      'Priority customer support 24/7',
      'Advanced analytics and reporting',
      'Custom lending terms and rates',
      'Dedicated relationship manager',
      'White-label platform access',
      'API access and integrations',
      'Advanced security features',
      'Custom compliance reporting'
    ]
  },
  {
    id: 'prod_SaoWmvhnHdfj7x',
    priceId: 'price_1RfctIG3rwHz1Z4EfHrWEotz',
    name: 'P6',
    description: 'Premium one-time package with advanced lending capabilities',
    price: 10000.00,
    currency: 'inr',
    mode: 'payment',
    features: [
      'Lifetime access to premium features',
      'Advanced loan matching algorithms',
      'Priority verification process',
      'Enhanced security protocols',
      'Advanced analytics dashboard',
      'Custom interest rate settings',
      'Bulk lending operations',
      'Premium customer support'
    ]
  },
  {
    id: 'prod_SaoVHTDpTKRkV7',
    priceId: 'price_1RfcsyG3rwHz1Z4EgMLfYIe7',
    name: 'P5',
    description: 'Professional enterprise package for serious lenders',
    price: 10000.00,
    currency: 'usd',
    mode: 'payment',
    features: [
      'Enterprise-grade lending tools',
      'Advanced risk assessment',
      'Professional reporting suite',
      'Custom lending workflows',
      'Priority customer support',
      'Advanced user management',
      'Custom branding options',
      'API access for integrations'
    ]
  },
  {
    id: 'prod_SaoVHeD2WSwF19',
    priceId: 'price_1RfcsiG3rwHz1Z4EUjjDYcNf',
    name: 'P4',
    description: 'Professional subscription for advanced lending features',
    price: 10000.00,
    currency: 'usd',
    mode: 'subscription',
    features: [
      'Professional lending tools',
      'Advanced AI verification',
      'Priority support and onboarding',
      'Custom lending parameters',
      'Advanced reporting and analytics',
      'Multi-currency support',
      'Enhanced security features',
      'Professional dashboard'
    ]
  },
  {
    id: 'prod_SanxmQQ4qkYU78',
    priceId: 'price_1RfcLDG3rwHz1Z4E5pLZtbAj',
    name: 'P3',
    description: 'Premium enterprise plan with advanced lending features and priority support',
    price: 5000.00,
    currency: 'usd',
    mode: 'payment',
    features: [
      'Advanced loan matching',
      'Priority customer support',
      'Enhanced analytics',
      'Custom loan terms',
      'Dedicated account manager',
      'Advanced risk assessment',
      'Professional reporting',
      'API access for integrations'
    ]
  },
  {
    id: 'prod_SanwoH3JZ835rh',
    priceId: 'price_1RfcKuG3rwHz1Z4E7AdXNyqO',
    name: 'P2',
    description: 'Professional plan for serious lenders with enhanced features',
    price: 1000.00,
    currency: 'usd',
    mode: 'payment',
    features: [
      'Extended loan limits up to ₹5,00,000',
      'Professional loan tools',
      'Priority verification process',
      'Advanced reporting and analytics',
      'Email and chat support',
      'Bulk lending operations',
      'Custom interest rate settings'
    ]
  },
  {
    id: 'prod_SaTx0bJvrWeFRQ',
    priceId: 'price_1RfIzoG3rwHz1Z4E29SKAJt4',
    name: 'Vibe',
    description: 'Monthly subscription for continuous access to the Vibe platform',
    price: 10.00,
    currency: 'usd',
    mode: 'subscription',
    features: [
      'Unlimited loan requests',
      'Basic AI verification',
      'Community support',
      'Mobile app access',
      'Standard verification',
      'Basic analytics',
      'Social feed features',
      'Voice navigation'
    ]
  }
];

export const getProductById = (id: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.id === id);
};

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.priceId === priceId);
};

export const getPaymentProducts = (): StripeProduct[] => {
  return stripeProducts.filter(product => product.mode === 'payment');
};

export const getSubscriptionProducts = (): StripeProduct[] => {
  return stripeProducts.filter(product => product.mode === 'subscription');
};

// Helper function to format currency based on product currency
export const formatProductPrice = (product: StripeProduct): string => {
  if (product.currency === 'inr') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(product.price);
  } else {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(product.price);
  }
};