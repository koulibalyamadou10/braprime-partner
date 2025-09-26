const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jeumizxzlwjvgerrcpjr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpldW1penh6bHdqdmdlcnJjcGpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDU1NzM2MSwiZXhwIjoyMDY2MTMzMzYxfQ.DjkvDuA9q3c6NqMmIkKvNw2ige31Kjn4bcfcVuX-BdI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugBusinessType() {
  try {
    console.log('🔍 Debug du type de business...');
    
    // 1. Vérifier tous les types de business disponibles
    console.log('\n📋 Types de business disponibles:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const { data: businessTypes, error: typesError } = await supabase
      .from('business_types')
      .select('*')
      .order('id');
    
    if (typesError) {
      console.error('❌ Erreur lors de la récupération des types:', typesError);
    } else {
      businessTypes.forEach(type => {
        console.log(`ID: ${type.id} | Nom: ${type.name} | Icône: ${type.icon} | Couleur: ${type.color}`);
        if (type.name === 'packages') {
          console.log(`  ✅ Type "packages" trouvé avec ID: ${type.id}`);
        }
      });
    }
    
    // 2. Vérifier tous les business et leurs types
    console.log('\n🏢 Business et leurs types:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const { data: businesses, error: businessError } = await supabase
      .from('businesses')
      .select(`
        id,
        name,
        business_type_id,
        owner_id,
        business_types (
          id,
          name,
          icon,
          color
        )
      `)
      .order('id');
    
    if (businessError) {
      console.error('❌ Erreur lors de la récupération des business:', businessError);
    } else {
      businesses.forEach(business => {
        const businessType = business.business_types?.[0];
        console.log(`🏢 ${business.name} (ID: ${business.id})`);
        console.log(`   Propriétaire ID: ${business.owner_id}`);
        console.log(`   Type ID: ${business.business_type_id}`);
        console.log(`   Type: ${businessType?.name || 'Non défini'}`);
        console.log(`   Icône: ${businessType?.icon || 'N/A'}`);
        console.log(`   Couleur: ${businessType?.color || 'N/A'}`);
        
        // Vérifier si c'est un business de type "packages"
        if (business.business_type_id === 64) {
          console.log(`   ✅ C'est un business de type "packages" - devrait voir l'option Colis`);
        } else {
          console.log(`   ❌ Ce n'est pas un business de type "packages" - ne devrait pas voir l'option Colis`);
        }
        console.log('');
      });
    }
    
    // 3. Vérifier spécifiquement les business de type "packages"
    console.log('\n📦 Business de type "packages" (ID: 64):');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const { data: packageBusinesses, error: packageError } = await supabase
      .from('businesses')
      .select(`
        id,
        name,
        business_type_id,
        owner_id,
        user_profiles (
          name,
          email
        )
      `)
      .eq('business_type_id', 64);
    
    if (packageError) {
      console.error('❌ Erreur lors de la récupération des business packages:', packageError);
    } else {
      if (packageBusinesses && packageBusinesses.length > 0) {
        console.log(`✅ ${packageBusinesses.length} business de type "packages" trouvé(s):`);
        packageBusinesses.forEach(business => {
          console.log(`🏢 ${business.name} (ID: ${business.id})`);
          console.log(`   Propriétaire: ${business.user_profiles?.name} (${business.user_profiles?.email})`);
        });
      } else {
        console.log('❌ Aucun business de type "packages" trouvé');
        console.log('💡 Il faut créer un business de type "packages" pour tester la fonctionnalité');
      }
    }
    
    // 4. Vérifier les utilisateurs et leurs business
    console.log('\n👥 Utilisateurs et leurs business:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select(`
        id,
        name,
        email,
        businesses (
          id,
          name,
          business_type_id,
          business_types (
            id,
            name
          )
        )
      `)
      .limit(5);
    
    if (usersError) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', usersError);
    } else {
      users.forEach(user => {
        console.log(`👤 ${user.name} (${user.email})`);
        if (user.businesses && user.businesses.length > 0) {
          user.businesses.forEach(business => {
            const businessType = business.business_types?.[0];
            console.log(`  🏢 ${business.name} - Type: ${businessType?.name} (ID: ${business.business_type_id})`);
          });
        } else {
          console.log(`  ❌ Aucun business associé`);
        }
        console.log('');
      });
    }
    
  } catch (err) {
    console.error('❌ Erreur générale:', err);
  }
}

debugBusinessType();
