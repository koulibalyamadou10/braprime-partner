// ============================================================================
// SCRIPT NODE.JS POUR CRÉER UN UTILISATEUR ADMINISTRATEUR
// ============================================================================
// Ce script crée automatiquement un utilisateur admin dans Supabase
// Exécutez: node scripts/create-admin.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erreur: Variables d\'environnement manquantes');
  console.error('Assurez-vous d\'avoir défini:');
  console.error('- VITE_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Configuration de l'admin
const adminConfig = {
  email: 'admin@bradelivery.gn',
  password: 'Admin123!', // Changez ce mot de passe
  first_name: 'Admin',
  last_name: 'BraPrime',
  phone: '+224 123 456 789'
};

async function createAdmin() {
  console.log('🚀 Début de la création de l\'utilisateur admin...');
  
  try {
    // Étape 1: Créer l'utilisateur dans Supabase Auth
    console.log('📝 Création de l\'utilisateur dans Supabase Auth...');
    
    const { data: user, error: userError } = await supabase.auth.admin.createUser({
      email: adminConfig.email,
      password: adminConfig.password,
      email_confirm: true,
      user_metadata: {
        first_name: adminConfig.first_name,
        last_name: adminConfig.last_name,
        role: 'admin'
      }
    });

    if (userError) {
      console.error('❌ Erreur lors de la création de l\'utilisateur:', userError.message);
      return;
    }

    console.log('✅ Utilisateur créé avec succès:', user.user.id);

    // Étape 2: Créer le profil admin dans la base de données
    console.log('👤 Création du profil admin dans la base de données...');
    
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: user.user.id,
        email: adminConfig.email,
        first_name: adminConfig.first_name,
        last_name: adminConfig.last_name,
        phone: adminConfig.phone,
        role: 'admin',
        is_active: true
      });

    if (profileError) {
      console.error('❌ Erreur lors de la création du profil:', profileError.message);
      
      // Essayer de supprimer l'utilisateur créé
      await supabase.auth.admin.deleteUser(user.user.id);
      console.log('🗑️ Utilisateur supprimé en raison de l\'erreur');
      return;
    }

    console.log('✅ Profil admin créé avec succès!');

    // Étape 3: Vérifier que tout fonctionne
    console.log('🔍 Vérification de la création...');
    
    const { data: profile, error: checkError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.user.id)
      .single();

    if (checkError || !profile) {
      console.error('❌ Erreur lors de la vérification:', checkError?.message);
      return;
    }

    // Étape 4: Afficher les informations de connexion
    console.log('\n🎉 ADMIN CRÉÉ AVEC SUCCÈS!');
    console.log('============================================================================');
    console.log('📧 Email:', adminConfig.email);
    console.log('🔑 Mot de passe:', adminConfig.password);
    console.log('🆔 ID utilisateur:', user.user.id);
    console.log('👤 Nom complet:', `${adminConfig.first_name} ${adminConfig.last_name}`);
    console.log('📱 Téléphone:', adminConfig.phone);
    console.log('🔗 URL de connexion:', `${supabaseUrl.replace('.supabase.co', '.supabase.co/auth/v1/login')}`);
    console.log('📊 Dashboard admin:', `${supabaseUrl.replace('.supabase.co', '.supabase.co/admin-dashboard')}`);
    console.log('============================================================================');
    console.log('\n⚠️ IMPORTANT:');
    console.log('1. Changez le mot de passe après la première connexion');
    console.log('2. Activez l\'authentification à deux facteurs pour plus de sécurité');
    console.log('3. Gardez ces informations en lieu sûr');
    console.log('============================================================================');

  } catch (error) {
    console.error('❌ Erreur inattendue:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Fonction pour vérifier si l'admin existe déjà
async function checkAdminExists() {
  try {
    const { data: existingAdmin, error } = await supabase
      .from('user_profiles')
      .select('id, email, created_at')
      .eq('email', adminConfig.email)
      .eq('role', 'admin')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ Erreur lors de la vérification:', error.message);
      return false;
    }

    if (existingAdmin) {
      console.log('⚠️ Un admin existe déjà:');
      console.log('   Email:', existingAdmin.email);
      console.log('   ID:', existingAdmin.id);
      console.log('   Créé le:', new Date(existingAdmin.created_at).toLocaleString());
      
      const response = await askQuestion('Voulez-vous continuer et créer un nouvel admin? (y/N): ');
      return response.toLowerCase() === 'y' || response.toLowerCase() === 'yes';
    }

    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
    return false;
  }
}

// Fonction pour demander une confirmation à l'utilisateur
function askQuestion(question) {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// Fonction principale
async function main() {
  console.log('🔧 Script de création d\'administrateur BraPrime');
  console.log('============================================================================');
  
  // Vérifier la configuration
  console.log('🔍 Vérification de la configuration...');
  console.log('   URL Supabase:', supabaseUrl);
  console.log('   Clé de service:', supabaseServiceKey ? '✅ Configurée' : '❌ Manquante');
  
  if (!supabaseServiceKey || supabaseServiceKey === 'YOUR_SERVICE_ROLE_KEY') {
    console.error('\n❌ Erreur: Clé de service Supabase manquante');
    console.error('Ajoutez SUPABASE_SERVICE_ROLE_KEY dans votre fichier .env');
    process.exit(1);
  }

  // Vérifier si l'admin existe déjà
  const shouldContinue = await checkAdminExists();
  if (!shouldContinue) {
    console.log('❌ Création annulée');
    process.exit(0);
  }

  // Créer l'admin
  await createAdmin();
}

// Exécuter le script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createAdmin, checkAdminExists }; 