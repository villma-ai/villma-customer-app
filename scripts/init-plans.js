import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDnkQrKHkiyJ7RezQZ5lLI2EY-QEbJQ1gw",
  authDomain: "villma-customer-app.firebaseapp.com",
  projectId: "villma-customer-app",
  storageBucket: "villma-customer-app.firebasestorage.app",
  messagingSenderId: "853788598210",
  appId: "1:853788598210:web:40d249bc1eb7852442405b",
  measurementId: "G-HNYLH1VM8R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const subscriptionPlans = [
  {
    name: 'BASE',
    billingCycle: 'monthly',
    price: 90,
    features: [
      'Intelligent scan of your store',
      'Chatbot agent connected to Villma Server',
      'Specialized Agent for pre-sales',
      'Specialized Agent for sales',
      'Specialized Agent for customer support'
    ],
    description: 'Good for all levels of business'
  },
  {
    name: 'BASE',
    billingCycle: 'yearly',
    price: 900,
    features: [
      'Intelligent scan of your store',
      'Chatbot agent connected to Villma Server',
      'Specialized Agent for pre-sales',
      'Specialized Agent for sales',
      'Specialized Agent for customer support',
      '2 months free (annual savings)'
    ],
    description: 'Good for all levels of business'
  },
  {
    name: 'EXTRA',
    billingCycle: 'monthly',
    price: 170,
    features: [
      'Everything in BASE Plan',
      'Consultant Agent',
      'Super Sales Agent'
    ],
    description: 'For complex products and enhanced sales support'
  },
  {
    name: 'EXTRA',
    billingCycle: 'yearly',
    price: 1700,
    features: [
      'Everything in BASE Plan',
      'Consultant Agent',
      'Super Sales Agent',
      '2 months free (annual savings)'
    ],
    description: 'For complex products and enhanced sales support'
  }
];

async function initializePlans() {
  try {
    console.log('Checking existing plans...');
    
    // Check if plans already exist
    const plansRef = collection(db, 'subscriptionPlans');
    const existingPlans = await getDocs(plansRef);
    
    if (!existingPlans.empty) {
      console.log('Removing existing plans...');
      // Delete existing plans
      const deletePromises = existingPlans.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      console.log('Existing plans removed.');
    }
    
    console.log('Initializing new subscription plans...');
    
    for (const plan of subscriptionPlans) {
      await addDoc(plansRef, plan);
      console.log(`Added ${plan.name} ${plan.billingCycle} plan - €${plan.price}`);
    }
    
    console.log('All subscription plans updated successfully!');
    console.log('\nNew Plans:');
    console.log('- BASE Monthly: €90/month');
    console.log('- BASE Yearly: €900/year');
    console.log('- EXTRA Monthly: €170/month');
    console.log('- EXTRA Yearly: €1700/year');
  } catch (error) {
    console.error('Error initializing plans:', error);
  }
}

// Run the initialization
initializePlans(); 