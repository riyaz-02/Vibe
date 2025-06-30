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
    description: 'Premium lending plan with advanced features',
    price: 5000.00,
    currency: 'usd',
    mode: 'payment',
    features: [
      'Advanced loan matching',
      'Priority support',
      'Enhanced analytics',
      'Custom loan terms',
      'Dedicated account manager'
    ]
  },
  {
    id: 'prod_SanwoH3JZ835rh',
    priceId: 'price_1RfcKuG3rwHz1Z4E7AdXNyqO',
    name: 'P2',
    description: 'Professional lending plan for serious lenders',
    price: 1000.00,
    currency: 'usd',
    mode: 'payment',
    features: [
      'Professional loan tools',
      'Extended loan limits',
      'Priority verification',
      'Advanced reporting',
      'Email support'
    ]
  },
  {
    id: 'prod_SaTx0bJvrWeFRQ',
    priceId: 'price_1RfIzoG3rwHz1Z4E29SKAJt4',
    name: 'Vibe',
    description: 'Monthly subscription for continuous access',
    price: 10.00,
    currency: 'usd',
    mode: 'subscription',
    popular: true,
    features: [
      'Unlimited loan requests',
      'Basic analytics',
      'Community support',
      'Mobile app access',
      'Standard verification'
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