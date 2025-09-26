const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jeumizxzlwjvgerrcpjr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpldW1penh6bHdqdmdlcnJjcGpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDU1NzM2MSwiZXhwIjoyMDY2MTMzMzYxfQ.DjkvDuA9q3c6NqMmIkKvNw2ige31Kjn4bcfcVuX-BdI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseFunctions() {
  try {
    console.log('🔍 Vérification des fonctions de la base de données...');
    
    // Vérifier les fonctions qui commencent par "get_partner"
    console.log('\n📋 Fonctions get_partner_* disponibles:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const { data: functions, error: functionsError } = await supabase
      .rpc('get_partner_stats', { business_id: 1 })
      .then(() => {
        console.log('✅ get_partner_stats existe');
        return { data: ['get_partner_stats'], error: null };
      })
      .catch((err) => {
        console.log('❌ get_partner_stats n\'existe pas:', err.message);
        return { data: [], error: err };
      });
    
    // Essayer d'autres fonctions possibles
    const possibleFunctions = [
      'get_partner_dashboard_stats',
      'get_business_stats',
      'get_dashboard_stats',
      'get_partner_orders_stats',
      'get_partner_revenue_stats'
    ];
    
    console.log('\n🔍 Test des fonctions alternatives:');
    for (const funcName of possibleFunctions) {
      try {
        await supabase.rpc(funcName, { business_id: 1 });
        console.log(`✅ ${funcName} existe`);
      } catch (err) {
        console.log(`❌ ${funcName} n'existe pas`);
      }
    }
    
    // Vérifier les tables disponibles
    console.log('\n📊 Tables disponibles:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['businesses', 'orders', 'order_items', 'payments', 'user_profiles'])
      .order('table_name');
    
    if (tablesError) {
      console.error('❌ Erreur lors de la récupération des tables:', tablesError);
    } else {
      tables.forEach(table => {
        console.log(`✅ ${table.table_name}`);
      });
    }
    
    // Vérifier les données de test
    console.log('\n🧪 Test de récupération de données de base:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Test 1: Récupérer un business
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id, name, business_type_id')
      .eq('business_type_id', 64)
      .limit(1)
      .single();
    
    if (businessError) {
      console.error('❌ Erreur lors de la récupération du business:', businessError);
    } else {
      console.log('✅ Business récupéré:', business);
    }
    
    // Test 2: Récupérer des commandes
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, status, total_amount, created_at')
      .limit(5);
    
    if (ordersError) {
      console.error('❌ Erreur lors de la récupération des commandes:', ordersError);
    } else {
      console.log(`✅ ${orders?.length || 0} commandes récupérées`);
    }
    
    // Test 3: Récupérer des paiements
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('id, amount, status, created_at')
      .limit(5);
    
    if (paymentsError) {
      console.error('❌ Erreur lors de la récupération des paiements:', paymentsError);
    } else {
      console.log(`✅ ${payments?.length || 0} paiements récupérés`);
    }
    
  } catch (err) {
    console.error('❌ Erreur générale:', err);
  }
}

checkDatabaseFunctions();
