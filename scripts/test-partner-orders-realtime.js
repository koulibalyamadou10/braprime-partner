// ============================================================================
// SCRIPT DE TEST POUR LES MISE À JOUR TEMPS RÉEL DES COMMANDES PARTENAIRES
// ============================================================================
// Ce script teste les mises à jour en temps réel des commandes dans le dashboard partenaire
// Exécutez ce script avec: node test-partner-orders-realtime.js

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://jeumizxzlwjvgerrcpjr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpldW1penh6bHdqdmdlcnJjcGpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzQ4NzQsImV4cCI6MjA1MDU1MDg3NH0.8Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ID de test pour un business partenaire
const TEST_BUSINESS_ID = 1; // Remplacez par un ID de business valide

console.log('🚀 Démarrage du test des mises à jour temps réel des commandes partenaire');
console.log('📋 Business ID de test:', TEST_BUSINESS_ID);

// Fonction pour créer une commande de test
async function createTestOrder() {
  try {
    const testOrder = {
      business_id: TEST_BUSINESS_ID,
      user_id: 'fe337710-3159-422c-8584-ef74b67be630', // UUID de test
      status: 'pending',
      total_amount: Math.floor(Math.random() * 200000) + 50000, // 50k à 250k GNF
      delivery_type: Math.random() > 0.5 ? 'asap' : 'scheduled',
      payment_method: 'cash',
      delivery_address: 'Adresse de test, Conakry, Guinée',
      zone: 'Zone Test',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('orders')
      .insert([testOrder])
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur lors de la création de la commande:', error);
      return null;
    }

    console.log('✅ Commande de test créée:', {
      id: data.id,
      status: data.status,
      amount: data.total_amount,
      type: data.delivery_type
    });

    return data;
  } catch (err) {
    console.error('❌ Erreur inattendue lors de la création:', err);
    return null;
  }
}

// Fonction pour mettre à jour le statut d'une commande
async function updateOrderStatus(orderId, newStatus) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select();

    if (error) {
      console.error('❌ Erreur lors de la mise à jour:', error);
      return;
    }

    console.log(`📦 Statut mis à jour: #${orderId.slice(-8)}`, {
      status: newStatus,
      timestamp: new Date().toLocaleTimeString()
    });
    
    return data[0];
  } catch (err) {
    console.error('❌ Erreur inattendue:', err);
  }
}

// Fonction pour simuler le cycle de vie d'une commande
async function simulateOrderLifecycle(orderId) {
  const statusFlow = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];
  
  console.log(`🔄 Simulation du cycle de vie pour la commande #${orderId.slice(-8)}`);
  
  for (let i = 0; i < statusFlow.length; i++) {
    const status = statusFlow[i];
    await updateOrderStatus(orderId, status);
    
    // Attendre 3 secondes entre chaque changement
    if (i < statusFlow.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  console.log(`✅ Cycle de vie terminé pour la commande #${orderId.slice(-8)}`);
}

// Fonction pour lister les commandes du business
async function listBusinessOrders() {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('business_id', TEST_BUSINESS_ID)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ Erreur lors de la récupération des commandes:', error);
      return;
    }

    console.log('📋 Commandes du business:');
    data.forEach(order => {
      console.log(`  - #${order.id.slice(-8)}: ${order.status} (${order.total_amount} GNF)`);
    });
  } catch (err) {
    console.error('❌ Erreur inattendue:', err);
  }
}

// Fonction principale de test
async function testRealtimeOrders() {
  console.log('\n🧪 Test des mises à jour temps réel des commandes partenaire');
  console.log('=' .repeat(60));
  
  // 1. Lister les commandes existantes
  console.log('\n1️⃣ Commandes existantes:');
  await listBusinessOrders();
  
  // 2. Créer une nouvelle commande
  console.log('\n2️⃣ Création d\'une nouvelle commande:');
  const newOrder = await createTestOrder();
  
  if (!newOrder) {
    console.log('❌ Impossible de créer une commande de test');
    return;
  }
  
  // 3. Attendre 2 secondes
  console.log('\n⏳ Attente de 2 secondes...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 4. Simuler le cycle de vie de la commande
  console.log('\n3️⃣ Simulation du cycle de vie:');
  await simulateOrderLifecycle(newOrder.id);
  
  // 5. Lister les commandes finales
  console.log('\n4️⃣ Commandes finales:');
  await listBusinessOrders();
  
  console.log('\n✅ Test terminé!');
  console.log('💡 Vérifiez le dashboard partenaire pour voir les mises à jour en temps réel');
}

// Fonction pour nettoyer les commandes de test
async function cleanupTestOrders() {
  try {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('business_id', TEST_BUSINESS_ID)
      .like('delivery_address', '%Adresse de test%');

    if (error) {
      console.error('❌ Erreur lors du nettoyage:', error);
      return;
    }

    console.log('🧹 Commandes de test nettoyées');
  } catch (err) {
    console.error('❌ Erreur inattendue lors du nettoyage:', err);
  }
}

// Exécution du script
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--cleanup')) {
    await cleanupTestOrders();
    return;
  }
  
  if (args.includes('--list')) {
    await listBusinessOrders();
    return;
  }
  
  await testRealtimeOrders();
}

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Erreur non gérée:', reason);
  process.exit(1);
});

// Exécution
main().catch(console.error);
