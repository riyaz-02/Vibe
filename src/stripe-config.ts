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
    id: 'prod_SanxmQQ4qkYU78',
    priceId: 'price_1RfcLDG3rwHz1Z4E5pLZtbAj',
    name: 'P3',
    description: 'Premium enterprise plan with advanced lending features and priority support',
    price: 5000.00,
    currency: 'usd',
    mode: 'payment',
    features: [
      'Unlimited loan requests and funding',
      'Advanced AI risk assessment',
      'Priority customer support',
      'Custom lending terms',
      'Advanced analytics dashboard',
      'Dedicated account manager',
      'White-label options',
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
    popular: true,
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