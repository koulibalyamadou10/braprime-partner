"use client";
import { supabase } from "@/lib/supabase";
import { createContext, useContext, useEffect, useState } from "react";

const CurrencyRoleContext = createContext<{ currencyRole: string, roles: string[] }>({ currencyRole: "GNF", roles: ["admin"] });

export function CurrencyRoleProvider({ children }: { children: React.ReactNode }) {
  const [currencyRole, setCurrencyRole] = useState<string>("GNF");
  const [roles, setRoles] = useState<string[]>(["admin"]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        // recuperer les roles de l'utilisateur
        // si il il est dans la table profiles c'est que c'est un admin
        // si non c'est un utilisateur interne il est dans la table profile_internal_user
        // on recupere les roles de l'utilisateur
        supabase.from('profil_internal_user').select('roles').eq('user_id', user.id).then(({ data }) => {
          // verifier si c'est vide
          if( data && data.length > 0) {
            setRoles(data[0].roles);
          } else {
            setRoles(["admin"]);
          }
        });
      }
    });
  }, []);

  return (
    <CurrencyRoleContext.Provider value={{ currencyRole, roles }}>
      {children}
    </CurrencyRoleContext.Provider>
  );
}

export function useCurrencyRole() {
  return useContext(CurrencyRoleContext);
} 