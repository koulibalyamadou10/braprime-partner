// creation d'un helper qui retourene le business du partenaire connecté
// et eventuellement d'autres informations si besoin

import { supabase } from "../supabase";

export const getUserWithManyInformationsForTheDashboard = async () => {
    
    let dataToReturn = {}

    try {
        // recuperer l'utilisateur connecté depuis le supabase
      const { data: user, error } = await supabase.auth.getUser();

      // verifier si le mail du user est dans la table profile_internal_user
      const { data: profileInternalUser, error: profileInternalUserError } = await supabase
        .from('profil_internal_user')
        .select('*')
        .eq('email', user?.user?.email)
        
      if (profileInternalUserError) {
        dataToReturn['isInternalUser'] = false
        dataToReturn['user'] = user?.user

        return dataToReturn;
      } else if (profileInternalUser) {
        const { data: business, error: businessError } = await supabase
        .from('business')
        .select('*')
        .eq('owner_id', user?.user?.id);
        
        if (businessError) {
            console.error('Erreur chargement business:', businessError);
            throw businessError;
        } else if (business) {
            dataToReturn['business'] = business[0]
            dataToReturn['internalUserProfile'] = profileInternalUser[0]
            dataToReturn['user'] = user?.user
            dataToReturn['isInternalUser'] = true
            dataToReturn['business'] = business[0]
            dataToReturn['internalUserProfile'] = profileInternalUser[0]
        }
      } 
    } catch (error) {
        console.error('Erreur chargement business:', error);
    } finally {
        return dataToReturn
    }

}