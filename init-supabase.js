const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration Supabase
const supabaseUrl = 'https://jeumizxzlwjvgerrcpjr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpldW1penh6bHdqdmdlcnJjcGpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NTczNjEsImV4cCI6MjA2NjEzMzM2MX0.KnkibttgTcUkz0KZYzRxTeybghlCj_VnnVlcDyUFZ-Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function initializeSupabase() {
  console.log('🚀 Initialisation de Supabase pour BraPrime...\n');

  try {
    // Lire le fichier SQL
    const sqlFile = path.join(__dirname, 'supabase-schema.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');

    console.log('📋 Exécution du schéma de base de données...');
    
    // Diviser le SQL en commandes individuelles
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (const command of commands) {
      try {
        if (command.trim()) {
          const { error } = await supabase.rpc('exec_sql', { sql: command });
          if (error) {
            console.log(`❌ Erreur: ${error.message}`);
            errorCount++;
          } else {
            successCount++;
          }
        }
      } catch (err) {
        console.log(`❌ Erreur lors de l'exécution: ${err.message}`);
        errorCount++;
      }
    }

    console.log(`\n✅ Initialisation terminée!`);
    console.log(`📊 Commandes réussies: ${successCount}`);
    console.log(`❌ Erreurs: ${errorCount}`);

    if (errorCount === 0) {
      console.log('\n🎉 Base de données initialisée avec succès!');
      console.log('📝 Prochaines étapes:');
      console.log('1. Allez sur https://jeumizxzlwjvgerrcpjr.supabase.co');
      console.log('2. Connectez-vous à votre dashboard');
      console.log('3. Vérifiez que les tables ont été créées');
      console.log('4. Testez l\'application sur http://localhost:8083');
    } else {
      console.log('\n⚠️  Certaines erreurs sont survenues.');
      console.log('📝 Veuillez exécuter manuellement le script SQL dans l\'éditeur Supabase.');
    }

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error.message);
    console.log('\n📝 Instructions manuelles:');
    console.log('1. Allez sur https://jeumizxzlwjvgerrcpjr.supabase.co');
    console.log('2. Naviguez vers SQL Editor');
    console.log('3. Copiez le contenu de supabase-schema.sql');
    console.log('4. Exécutez le script');
  }
}

// Fonction pour tester la connexion
async function testConnection() {
  console.log('🔍 Test de connexion à Supabase...');
  
  try {
    const { data, error } = await supabase.from('categories').select('count');
    
    if (error) {
      console.log('❌ Erreur de connexion:', error.message);
      return false;
    }
    
    console.log('✅ Connexion réussie!');
    return true;
  } catch (error) {
    console.log('❌ Erreur de connexion:', error.message);
    return false;
  }
}

// Fonction pour insérer des données de test
async function insertTestData() {
  console.log('\n📝 Insertion des données de test...');
  
  try {
    // Insérer des catégories
    const categories = [
      { name: 'Restaurants', icon: 'Utensils', color: 'bg-guinea-red', link: '/restaurants' },
      { name: 'Cafés', icon: 'Coffee', color: 'bg-guinea-yellow', link: '/cafes' },
      { name: 'Marchés', icon: 'ShoppingBasket', color: 'bg-guinea-green', link: '/markets' },
      { name: 'Supermarchés', icon: 'ShoppingCart', color: 'bg-blue-500', link: '/supermarkets' },
      { name: 'Colis', icon: 'Package', color: 'bg-purple-500', link: '/packages' },
      { name: 'Cadeaux', icon: 'Gift', color: 'bg-pink-500', link: '/gifts' },
      { name: 'Pharmacie', icon: 'Pill', color: 'bg-green-500', link: '/pharmacy' },
      { name: 'Électronique', icon: 'Tv', color: 'bg-indigo-500', link: '/electronic-stores' },
      { name: 'Fournitures', icon: 'Briefcase', color: 'bg-amber-500', link: '/supplies' },
      { name: 'Documents', icon: 'FileText', color: 'bg-sky-500', link: '/documents' },
      { name: 'Beauté', icon: 'Sparkles', color: 'bg-pink-400', link: '/beauty' },
      { name: 'Bricolage', icon: 'Hammer', color: 'bg-zinc-600', link: '/hardware' },
      { name: 'Coiffure', icon: 'Scissors', color: 'bg-slate-500', link: '/hairdressing' }
    ];

    const { error: categoriesError } = await supabase
      .from('categories')
      .upsert(categories, { onConflict: 'name' });

    if (categoriesError) {
      console.log('❌ Erreur lors de l\'insertion des catégories:', categoriesError.message);
    } else {
      console.log('✅ Catégories insérées avec succès');
    }

    // Insérer des restaurants de test
    const restaurants = [
      {
        name: 'Le Petit Baoulé',
        description: 'Découvrez les saveurs authentiques de la cuisine guinéenne traditionnelle au Petit Baoulé. Nos plats sont préparés avec des ingrédients frais et locaux par nos chefs expérimentés.',
        cuisine_type: 'Cuisine Guinéenne',
        cover_image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        logo: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
        rating: 4.8,
        review_count: 124,
        delivery_time: '25-35 min',
        delivery_fee: 15000,
        address: 'Rue KA-003, Quartier Almamya, Kaloum, Conakry',
        phone: '+224 621 23 45 67',
        opening_hours: '10:00 - 22:00',
        is_active: true
      },
      {
        name: 'Conakry Grill House',
        description: 'Restaurant spécialisé dans les grillades et barbecues avec une ambiance conviviale et des saveurs internationales.',
        cuisine_type: 'Grillades',
        cover_image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
        rating: 4.7,
        review_count: 89,
        delivery_time: '30-45 min',
        delivery_fee: 20000,
        address: 'Boulevard du Commerce, Ratoma, Conakry',
        phone: '+224 628 34 56 78',
        opening_hours: '11:00 - 23:00',
        is_active: true
      },
      {
        name: 'Fruits de Mer Conakry',
        description: 'Spécialiste des fruits de mer frais et des plats de poisson traditionnels guinéens.',
        cuisine_type: 'Fruits de Mer',
        cover_image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        logo: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
        rating: 4.6,
        review_count: 67,
        delivery_time: '35-50 min',
        delivery_fee: 18000,
        address: 'Corniche Nord, Dixinn, Conakry',
        phone: '+224 666 45 67 89',
        opening_hours: '12:00 - 22:00',
        is_active: true
      }
    ];

    const { data: restaurantData, error: restaurantsError } = await supabase
      .from('restaurants')
      .upsert(restaurants, { onConflict: 'name' })
      .select('id');

    if (restaurantsError) {
      console.log('❌ Erreur lors de l\'insertion des restaurants:', restaurantsError.message);
    } else {
      console.log('✅ Restaurants insérés avec succès');
      
      // Insérer des articles de menu si les restaurants ont été créés
      if (restaurantData && restaurantData.length > 0) {
        const menuItems = [
          {
            restaurant_id: restaurantData[0].id,
            name: 'Poulet Yassa',
            description: 'Poulet mariné avec oignons, citron et épices, servi avec du riz',
            price: 60000,
            image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            category_id: 3,
            is_popular: true,
            is_available: true
          },
          {
            restaurant_id: restaurantData[0].id,
            name: 'Sauce Arachide',
            description: 'Ragoût traditionnel à base de pâte d\'arachide avec viande et légumes',
            price: 55000,
            image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            category_id: 3,
            is_popular: true,
            is_available: true
          },
          {
            restaurant_id: restaurantData[0].id,
            name: 'Jus de Gingembre',
            description: 'Boisson rafraîchissante à base de gingembre frais',
            price: 15000,
            image: 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            category_id: 5,
            is_popular: true,
            is_available: true
          }
        ];

        const { error: menuError } = await supabase
          .from('menu_items')
          .upsert(menuItems, { onConflict: 'restaurant_id,name' });

        if (menuError) {
          console.log('❌ Erreur lors de l\'insertion du menu:', menuError.message);
        } else {
          console.log('✅ Articles de menu insérés avec succès');
        }
      }
    }

  } catch (error) {
    console.log('❌ Erreur lors de l\'insertion des données de test:', error.message);
  }
}

// Fonction principale
async function main() {
  console.log('🎯 BraPrime - Initialisation Supabase\n');
  
  const isConnected = await testConnection();
  
  if (isConnected) {
    await insertTestData();
  } else {
    console.log('\n📝 Veuillez d\'abord exécuter le script SQL manuellement dans Supabase.');
    console.log('1. Allez sur https://jeumizxzlwjvgerrcpjr.supabase.co');
    console.log('2. Naviguez vers SQL Editor');
    console.log('3. Copiez le contenu de supabase-schema.sql');
    console.log('4. Exécutez le script');
    console.log('5. Relancez ce script: node init-supabase.js');
  }
}

// Exécuter le script
main().catch(console.error); 