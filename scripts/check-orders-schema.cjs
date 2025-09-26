const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jeumizxzlwjvgerrcpjr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpldW1penh6bHdqdmdlcnJjcGpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDU1NzM2MSwiZXhwIjoyMDY2MTMzMzYxfQ.DjkvDuA9q3c6NqMmIkKvNw2ige31Kjn4bcfcVuX-BdI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOrdersSchema() {
  try {
    console.log('🔍 Vérification du schéma de la table orders...');
    
    // Récupérer une commande pour voir sa structure
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .limit(1);
    
    if (ordersError) {
      console.error('❌ Erreur lors de la récupération des commandes:', ordersError);
      return;
    }
    
    if (orders && orders.length > 0) {
      console.log('✅ Structure de la table orders:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      const order = orders[0];
      Object.keys(order).forEach(key => {
        console.log(`${key}: ${typeof order[key]} = ${order[key]}`);
      });
    } else {
      console.log('❌ Aucune commande trouvée');
    }
    
    // Vérifier les colonnes spécifiques
    console.log('\n🔍 Vérification des colonnes spécifiques:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const columnsToCheck = [
      'id', 'user_id', 'business_id', 'status', 'created_at', 
      'total_amount', 'grand_total', 'amount', 'total', 'price'
    ];
    
    for (const column of columnsToCheck) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(column)
          .limit(1);
        
        if (error) {
          console.log(`❌ ${column}: ${error.message}`);
        } else {
          console.log(`✅ ${column}: existe`);
        }
      } catch (err) {
        console.log(`❌ ${column}: ${err.message}`);
      }
    }
    
  } catch (err) {
    console.error('❌ Erreur générale:', err);
  }
}

checkOrdersSchema();
