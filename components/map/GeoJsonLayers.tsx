'use client'

import { memo } from 'react'
import { LayersControl, GeoJSON } from 'react-leaflet'

// Memoized GeoJSON layers to prevent heavy re-renders
export const GeoJsonLayers = memo(({ 
  wmkData, 
  sungaiData, 
  titikData, 
  wmkStyle, 
  sungaiStyle, 
  pointToLayer, 
  onEachFeatureWmk, 
  onEachFeatureSungai, 
  onEachFeatureTitik 
}: any) => {
  if (!wmkData && !sungaiData && !titikData) return null;

  return (
    <LayersControl position="topright">
      {wmkData && (
        <LayersControl.Overlay name="WMK Sektor Per Kalurahan" checked>
          <GeoJSON 
            data={wmkData} 
            style={wmkStyle} 
            onEachFeature={onEachFeatureWmk} 
          />
        </LayersControl.Overlay>
      )}

      {sungaiData && (
        <LayersControl.Overlay name="Sungai" checked>
          <GeoJSON 
            data={sungaiData} 
            style={sungaiStyle} 
            onEachFeature={onEachFeatureSungai} 
          />
        </LayersControl.Overlay>
      )}

      {titikData && (
        <LayersControl.Overlay name="Titik Sektor" checked>
          <GeoJSON 
            data={titikData} 
            pointToLayer={pointToLayer} 
            onEachFeature={onEachFeatureTitik} 
          />
        </LayersControl.Overlay>
      )}
    </LayersControl>
  );
});

GeoJsonLayers.displayName = 'GeoJsonLayers';
