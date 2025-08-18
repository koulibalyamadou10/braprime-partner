// creation d'un helper qui retourene le business du partenaire connecté
// et eventuellement d'autres informations si besoin

import { supabase } from "../supabase";

export interface UserWithBusiness {
  user: any;
  business: any;
  internalUserProfile: any;
  isInternalUser: boolean;
}

export const getUserWithManyInformationsForTheDashboard = async (): Promise<UserWithBusiness | null> => {
    
    let dataToReturn: UserWithBusiness = {
      user: null,
      business: null,
      internalUserProfile: null,
      isInternalUser: false
    }

    try {
        // recuperer l'utilisateur connecté depuis le supabase
      const { data: user, error } = await supabase.auth.getUser();

      if (error || !user?.user) {
        console.error('Erreur récupération utilisateur:', error);
        return null;
      }

      // verifier si le mail du user est dans la table profile_internal_user
      const { data: profileInternalUser1,   error: profileInternalUserError1 } = await supabase
        .from('profil_internal_user')
        .select('*')
        .eq('email', user.user.email)
        
      // c'est un utilisateur qui est dans user_profiles
      if (profileInternalUserError1) {
        console.error('Erreur récupération profil interne:', profileInternalUserError1);
        dataToReturn.user = user.user;
        dataToReturn.isInternalUser = false;

        // recuperer le business du user
        const { data: business, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.user.id);
        
        
        if (businessError) {
            console.error('Erreur chargement business:', businessError);
            throw businessError;
        } else if (business && business.length > 0) {
            dataToReturn.business = business[0];
        }

        return dataToReturn;
      } 

      // c'est un utilisateur recuperer le created_by dans la table profile_internal_user
      const { data: profileInternalUser2, error: profileInternalUserError2 } = await supabase
        .from('profil_internal_user')
        .select('*')
        .eq('created_by', user.user.id);
        
        
        if (profileInternalUserError2) {
            console.error('Erreur chargement profil interne:', profileInternalUserError2);
            throw profileInternalUserError2;
        } else if (profileInternalUser2 && profileInternalUser2.length > 0) {
            dataToReturn.internalUserProfile = profileInternalUser2[0];
            dataToReturn.user = user.user;
            dataToReturn.isInternalUser = true;
        }
      
      if (profileInternalUser2 && profileInternalUser2.length > 0) {
        const { data: business, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', profileInternalUser2[0].created_by);
        
        if (businessError) {
            console.error('Erreur chargement business:', businessError);
            throw businessError;
        } else if (business && business.length > 0) {
            dataToReturn.business = business[0];
            dataToReturn.internalUserProfile = profileInternalUser2[0];
            dataToReturn.user = user.user;
            dataToReturn.isInternalUser = true;
        }
      } 
    } catch (error) {
        console.error('Erreur chargement business:', error);
        return null;
    } finally {
        return dataToReturn;
    }

}