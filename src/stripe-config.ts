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
    id: 'prod_Saoi1s1fOp0igX',
    priceId: 'price_1Rfd4aG3rwHz1Z4ESZTLOJ4y',
    name: 'Pro',
    description: 'Yearly Plan',
    price: 599.00,
    currency: 'inr',
    mode: 'subscription',
    popular: true,
    features: [
      'Unlimited loan requests and funding',
      'Priority customer support',
      'Advanced analytics and reporting',
      'Custom lending terms and rates',
      'AI-powered risk assessment',
      'Priority verification process',
      'Enhanced security features',
      'Advanced user management'
    ]
  },
  {
    id: 'prod_SaohtNn1GFLFui',
    priceId: 'price_1Rfd3mG3rwHz1Z4ETTfN0IPs',
    name: 'Premium',
    description: 'Yearly Payment',
    price: 299.00,
    currency: 'inr',
    mode: 'subscription',
    features: [
      'Multiple loan requests',
      'Advanced loan matching',
      'Priority verification',
      'Enhanced security',
      'Analytics dashboard',
      'Custom interest rates',
      'Email support',
      'Mobile app access'
    ]
  },
  {
    id: 'prod_SaogKlbbUxUgZW',
    priceId: 'price_1Rfd2yG3rwHz1Z4EgedIcwd3',
    name: 'Starter',
    description: 'Yearly Payment, Can be Upgraded Later',
    price: 99.00,
    currency: 'inr',
    mode: 'subscription',
    features: [
      'Basic loan requests',
      'Standard verification',
      'Basic analytics',
      'Standard security',
      'Community support',
      'Social feed features',
      'Voice navigation',
      'Mobile app access'
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