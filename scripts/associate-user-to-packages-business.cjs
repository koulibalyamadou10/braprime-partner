const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jeumizxzlwjvgerrcpjr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpldW1penh6bHdqdmdlcnJjcGpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDU1NzM2MSwiZXhwIjoyMDY2MTMzMzYxfQ.DjkvDuA9q3c6NqMmIkKvNw2ige31Kjn4bcfcVuX-BdI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function associateUserToPackagesBusiness() {
  try {
    console.log('🔗 Association d\'un utilisateur à un business de type "packages"...');
    
    const userEmail = 'mory.koulibaly@nimbasolution.com';
    
    // 1. Trouver l'utilisateur par email
    console.log(`\n👤 Recherche de l'utilisateur: ${userEmail}`);
    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .select('id, name, email')
      .eq('email', userEmail)
      .single();
    
    if (userError) {
      console.error('❌ Erreur lors de la recherche de l\'utilisateur:', userError);
      return;
    }
    
    if (!user) {
      console.error('❌ Utilisateur non trouvé');
      return;
    }
    
    console.log(`✅ Utilisateur trouvé: ${user.name} (ID: ${user.id})`);
    
    // 2. Trouver un business de type "packages" disponible
    console.log('\n📦 Recherche d\'un business de type "packages" disponible...');
    const { data: packageBusinesses, error: businessError } = await supabase
      .from('businesses')
      .select(`
        id,
        name,
        business_type_id,
        owner_id,
        business_types (
          id,
          name
        )
      `)
      .eq('business_type_id', 64)
      .limit(1);
    
    if (businessError) {
      console.error('❌ Erreur lors de la recherche des business packages:', businessError);
      return;
    }
    
    if (!packageBusinesses || packageBusinesses.length === 0) {
      console.error('❌ Aucun business de type "packages" trouvé');
      return;
    }
    
    const targetBusiness = packageBusinesses[0];
    console.log(`✅ Business trouvé: ${targetBusiness.name} (ID: ${targetBusiness.id})`);
    console.log(`   Type: ${targetBusiness.business_types?.[0]?.name}`);
    console.log(`   Propriétaire actuel: ${targetBusiness.owner_id || 'Aucun'}`);
    
    // 3. Vérifier si l'utilisateur a déjà un business
    console.log('\n🔍 Vérification des business existants de l\'utilisateur...');
    const { data: existingBusinesses, error: existingError } = await supabase
      .from('businesses')
      .select('id, name, business_type_id')
      .eq('owner_id', user.id);
    
    if (existingError) {
      console.error('❌ Erreur lors de la vérification des business existants:', existingError);
      return;
    }
    
    if (existingBusinesses && existingBusinesses.length > 0) {
      console.log('⚠️ L\'utilisateur a déjà des business associés:');
      existingBusinesses.forEach(business => {
        console.log(`   - ${business.name} (ID: ${business.id}, Type: ${business.business_type_id})`);
      });
      
      // Vérifier s'il a déjà un business de type packages
      const hasPackagesBusiness = existingBusinesses.some(b => b.business_type_id === 64);
      if (hasPackagesBusiness) {
        console.log('✅ L\'utilisateur a déjà un business de type "packages" - pas besoin d\'association');
        return;
      }
    } else {
      console.log('ℹ️ L\'utilisateur n\'a aucun business associé');
    }
    
    // 4. Associer l'utilisateur au business de type packages
    console.log('\n🔗 Association de l\'utilisateur au business de type "packages"...');
    const { error: updateError } = await supabase
      .from('businesses')
      .update({ owner_id: user.id })
      .eq('id', targetBusiness.id);
    
    if (updateError) {
      console.error('❌ Erreur lors de l\'association:', updateError);
      return;
    }
    
    console.log('✅ Association réussie !');
    console.log(`   Utilisateur: ${user.name} (${user.email})`);
    console.log(`   Business: ${targetBusiness.name} (Type: packages)`);
    
    // 5. Vérifier l'association
    console.log('\n🔍 Vérification de l\'association...');
    const { data: updatedBusiness, error: verifyError } = await supabase
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
      .eq('id', targetBusiness.id)
      .single();
    
    if (verifyError) {
      console.error('❌ Erreur lors de la vérification:', verifyError);
      return;
    }
    
    console.log('✅ Vérification réussie:');
    console.log(`   Business: ${updatedBusiness.name}`);
    console.log(`   Propriétaire: ${updatedBusiness.user_profiles?.name} (${updatedBusiness.user_profiles?.email})`);
    console.log(`   Type: packages (ID: ${updatedBusiness.business_type_id})`);
    
    console.log('\n🎉 Terminé ! L\'utilisateur devrait maintenant voir l\'option "Colis" dans le menu.');
    
  } catch (err) {
    console.error('❌ Erreur générale:', err);
  }
}

associateUserToPackagesBusiness();
