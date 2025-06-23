import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with webpack/vite
// We need to redefine the default icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface DeliveryMapProps {
  deliveryAddress: string;
  driverLocation?: { lat: number; lng: number };
}

const DeliveryMap = ({ deliveryAddress, driverLocation }: DeliveryMapProps) => {
  // Center of Guinea Conakry
  const guineaCenter = { lat: 9.9456, lng: -9.6966 };
  
  // Simulated restaurant location (random location in Conakry)
  const restaurantLocation = { lat: 9.5092, lng: -13.7122 };
  
  // Simulated delivery location (random location in Conakry)
  const deliveryLocation = { lat: 9.5370, lng: -13.6785 };
  
  // Default driver location or use provided one
  const currentDriverLocation = driverLocation || { lat: 9.5230, lng: -13.6950 };

  return (
    <div className="h-full w-full">
      <MapContainer 
        center={guineaCenter} 
        zoom={13} 
        style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Restaurant Marker */}
        <Marker position={restaurantLocation}>
          <Popup>
            Restaurant
          </Popup>
        </Marker>
        
        {/* Delivery Location Marker */}
        <Marker position={deliveryLocation}>
          <Popup>
            Livraison: {deliveryAddress}
          </Popup>
        </Marker>
        
        {/* Driver Marker */}
        <Marker position={currentDriverLocation}>
          <Popup>
            Livreur en route
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default DeliveryMap; 