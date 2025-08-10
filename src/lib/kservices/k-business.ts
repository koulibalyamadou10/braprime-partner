import { supabase } from "../supabase";

export class KBusinessService {

    // 1- Fonction pour recuperer le business en fonction de l'id du business
    static async getBusiness(owner_id: string) {
        const { data, error } = await supabase
            .from('businesses')
            .select('*')
            .eq('owner_id', owner_id)
            .single();

        if (error) {
            throw error;
        }

        return data;
    }
}   