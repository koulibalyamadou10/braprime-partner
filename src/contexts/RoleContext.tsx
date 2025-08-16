import React, { createContext, useContext, useState, useEffect } from "react";

const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
  const [role, setRole] = useState(null);  // null = pas encore chargé
  const [loading, setLoading] = useState(true);

  // Simuler récupération depuis API
  useEffect(() => {
    const fetchRole = async () => {
      try {
        // Exemple : appel à ton backend
        const response = await fetch("http://localhost:5000/api/user/123");
        const data = await response.json();
        
        setRole(data.role); // on suppose que l’API renvoie { "role": "admin" }
      } catch (error) {
        console.error("Erreur de récupération du rôle :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, []);

  return (
    <RoleContext.Provider value={{ role, loading }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => useContext(RoleContext);
