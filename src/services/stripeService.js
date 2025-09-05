import { config } from './config.js'

class StripeService {
  constructor() {
    this.publishableKey = config.stripe.publishableKey
    this.stripe = null
    this.initialized = false
  }

  async initialize() {
    if (this.initialized) return this.stripe

    if (!this.publishableKey) {
      console.warn('Stripe publishable key not configured')
      return null
    }

    try {
      // Load Stripe.js dynamically
      if (!window.Stripe) {
        await this.loadStripeScript()
      }

      this.stripe = window.Stripe(this.publishableKey)
      this.initialized = true
      return this.stripe
    } catch (error) {
      console.error('Error initializing Stripe:', error)
      return null
    }
  }

  async loadStripeScript() {
    return new Promise((resolve, reject) => {
      if (window.Stripe) {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://js.stripe.com/v3/'
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  async createSubscription(priceId, userId) {
    if (!this.publishableKey) {
      console.warn('Stripe not configured, simulating subscription')
      return this.simulateSubscription(priceId, userId)
    }

    try {
      await this.initialize()
      
      if (!this.stripe) {
        throw new Error('Stripe not initialized')
      }

      // In a real implementation, you would call your backend API here
      // to create a subscription and get a client secret
      const response = await this.createSubscriptionOnBackend(priceId, userId)
      
      if (response.clientSecret) {
        // Redirect to Stripe Checkout or use Payment Element
        const { error } = await this.stripe.confirmPayment({
          clientSecret: response.clientSecret,
          confirmParams: {
            return_url: `${window.location.origin}/profile?subscription=success`
          }
        })

        if (error) {
          throw error
        }

        return { success: true, subscriptionId: response.subscriptionId }
      }

      return response
    } catch (error) {
      console.error('Error creating subscription:', error)
      return { success: false, error: error.message }
    }
  }

  async createCheckoutSession(priceId, userId, successUrl, cancelUrl) {
    if (!this.publishableKey) {
      console.warn('Stripe not configured, simulating checkout')
      return this.simulateCheckout(priceId, userId)
    }

    try {
      // In a real implementation, this would call your backend
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          priceId,
          userId,
          successUrl: successUrl || `${window.location.origin}/profile?subscription=success`,
          cancelUrl: cancelUrl || `${window.location.origin}/profile?subscription=cancelled`
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const session = await response.json()
      
      await this.initialize()
      
      if (this.stripe) {
        const { error } = await this.stripe.redirectToCheckout({
          sessionId: session.id
        })

        if (error) {
          throw error
        }
      }

      return { success: true, sessionId: session.id }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      return this.simulateCheckout(priceId, userId)
    }
  }

  async cancelSubscription(subscriptionId) {
    if (!this.publishableKey) {
      console.warn('Stripe not configured, simulating cancellation')
      return this.simulateCancellation(subscriptionId)
    }

    try {
      // In a real implementation, this would call your backend
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subscriptionId })
      })

      if (!response.ok) {
        throw new Error('Failed to cancel subscription')
      }

      const result = await response.json()
      return { success: true, subscription: result }
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      return this.simulateCancellation(subscriptionId)
    }
  }

  async getSubscriptionStatus(userId) {
    if (!this.publishableKey) {
      console.warn('Stripe not configured, using local status')
      return this.getLocalSubscriptionStatus(userId)
    }

    try {
      // In a real implementation, this would call your backend
      const response = await fetch(`/api/subscription-status/${userId}`)
      
      if (!response.ok) {
        throw new Error('Failed to get subscription status')
      }

      const status = await response.json()
      return status
    } catch (error) {
      console.error('Error getting subscription status:', error)
      return this.getLocalSubscriptionStatus(userId)
    }
  }

  async updatePaymentMethod(subscriptionId, paymentMethodId) {
    if (!this.publishableKey) {
      console.warn('Stripe not configured, simulating payment method update')
      return { success: true, message: 'Payment method updated (simulated)' }
    }

    try {
      // In a real implementation, this would call your backend
      const response = await fetch('/api/update-payment-method', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subscriptionId, paymentMethodId })
      })

      if (!response.ok) {
        throw new Error('Failed to update payment method')
      }

      const result = await response.json()
      return { success: true, subscription: result }
    } catch (error) {
      console.error('Error updating payment method:', error)
      return { success: false, error: error.message }
    }
  }

  // Backend API simulation methods (for development/demo)
  async createSubscriptionOnBackend(priceId, userId) {
    // Simulate backend API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          subscriptionId: `sub_${Date.now()}`,
          clientSecret: `pi_${Date.now()}_secret_test`,
          status: 'requires_payment_method'
        })
      }, 1000)
    })
  }

  simulateSubscription(priceId, userId) {
    // Simulate successful subscription for development
    const subscription = {
      success: true,
      subscriptionId: `sim_sub_${Date.now()}`,
      status: 'active',
      priceId,
      userId,
      createdAt: new Date().toISOString()
    }

    // Store in localStorage for persistence
    const subscriptions = JSON.parse(localStorage.getItem('kyrh_subscriptions') || '{}')
    subscriptions[userId] = subscription
    localStorage.setItem('kyrh_subscriptions', JSON.stringify(subscriptions))

    return subscription
  }

  simulateCheckout(priceId, userId) {
    // Simulate checkout redirect
    const sessionId = `cs_sim_${Date.now()}`
    
    // Store pending subscription
    const pendingSubscription = {
      sessionId,
      priceId,
      userId,
      status: 'pending',
      createdAt: new Date().toISOString()
    }

    localStorage.setItem('kyrh_pending_subscription', JSON.stringify(pendingSubscription))

    // Simulate redirect to success page after a delay
    setTimeout(() => {
      const subscription = this.simulateSubscription(priceId, userId)
      localStorage.removeItem('kyrh_pending_subscription')
      
      // Trigger a custom event to notify the app
      window.dispatchEvent(new CustomEvent('subscription-completed', {
        detail: subscription
      }))
    }, 2000)

    return { success: true, sessionId, simulated: true }
  }

  simulateCancellation(subscriptionId) {
    // Simulate subscription cancellation
    const subscriptions = JSON.parse(localStorage.getItem('kyrh_subscriptions') || '{}')
    
    for (const userId in subscriptions) {
      if (subscriptions[userId].subscriptionId === subscriptionId) {
        subscriptions[userId].status = 'cancelled'
        subscriptions[userId].cancelledAt = new Date().toISOString()
        break
      }
    }

    localStorage.setItem('kyrh_subscriptions', JSON.stringify(subscriptions))

    return {
      success: true,
      subscription: {
        id: subscriptionId,
        status: 'cancelled',
        cancelledAt: new Date().toISOString()
      }
    }
  }

  getLocalSubscriptionStatus(userId) {
    const subscriptions = JSON.parse(localStorage.getItem('kyrh_subscriptions') || '{}')
    const subscription = subscriptions[userId]

    if (!subscription) {
      return {
        status: 'inactive',
        subscriptionId: null,
        priceId: null
      }
    }

    return {
      status: subscription.status,
      subscriptionId: subscription.subscriptionId,
      priceId: subscription.priceId,
      createdAt: subscription.createdAt,
      cancelledAt: subscription.cancelledAt
    }
  }

  // Pricing configuration
  getPricingPlans() {
    return {
      free: {
        id: 'free',
        name: 'Free',
        price: 0,
        interval: null,
        features: [
          'Basic rights information',
          '3 de-escalation scripts',
          'Limited recording storage'
        ]
      },
      premium: {
        id: 'price_premium_monthly', // This would be your actual Stripe price ID
        name: 'Premium',
        price: 5,
        interval: 'month',
        features: [
          'Advanced location-specific rights',
          'Unlimited custom scripts',
          'Unlimited recording storage',
          'Priority support',
          'Ad-free experience'
        ]
      }
    }
  }
}

export default new StripeService()
