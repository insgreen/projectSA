import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { ROUTES } from '../data/routesData';

export default function LeafletMapComponent({
  visibleRoutes,
  visibleBuses,
  selectedBus,
  setSelectedBus,
  selectedStop,
  setSelectedStop,
  userWaitingStop
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layerGroupRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    
    // Support module import (L) or CDN global (window.L)
    const leafletObj = (typeof L !== 'undefined' && L.map) ? L : (typeof window !== 'undefined' ? window.L : null);
    if (!leafletObj) return;

    // Centered on Walailak University campus (Thasala, Nakhon Si Thammarat)
    const map = leafletObj.map(containerRef.current, {
      center: [8.6445, 99.8970],
      zoom: 15,
      zoomControl: false
    });

    // Zoom Controls
    leafletObj.control.zoom({ position: 'bottomright' }).addTo(map);

    // Single OpenStreetMap Standard Tile Layer (Exact clean ViaBus map style)
    leafletObj.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const layerGroup = leafletObj.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        try {
          layerGroupRef.current?.clearLayers();
          mapRef.current.off();
          mapRef.current.remove();
        } catch (err) {
          // Ignore DOM cleanup collision
        }
        mapRef.current = null;
      }
    };
  }, []);

  // Auto-center map smooth flyTo when user searches/selects a stop or bus
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (selectedStop && selectedStop.lat && selectedStop.lng) {
      map.flyTo([selectedStop.lat, selectedStop.lng], 16, { animate: true, duration: 1 });
    } else if (selectedBus) {
      const route = ROUTES.find((r) => r.id === selectedBus.route);
      if (route && route.polyline.length > 0) {
        const pos = route.polyline[selectedBus.progressIndex % route.polyline.length];
        if (pos) {
          map.flyTo([pos.lat, pos.lng], 16, { animate: true, duration: 1 });
        }
      }
    }
  }, [selectedStop, selectedBus?.id]);

  // Sync Layers (Polylines, Stops, Bus Markers) on data update
  useEffect(() => {
    const map = mapRef.current;
    const layerGroup = layerGroupRef.current;
    const leafletObj = (typeof L !== 'undefined' && L.map) ? L : (typeof window !== 'undefined' ? window.L : null);
    if (!map || !layerGroup || !leafletObj) return;

    layerGroup.clearLayers();

    // 1. Render Route Polylines & Stop Markers
    visibleRoutes.forEach((route) => {
      const latLngs = route.polyline.map((p) => [p.lat, p.lng]);

      // Glow backdrop
      leafletObj.polyline(latLngs, {
        color: route.color,
        weight: 9,
        opacity: 0.35,
        lineCap: 'round'
      }).addTo(layerGroup);

      // Core Animated Dashed Polyline
      leafletObj.polyline(latLngs, {
        color: route.color,
        weight: 5,
        opacity: 0.95,
        dashArray: '10, 10',
        className: 'animatedDashedPolyline',
        lineCap: 'round'
      }).addTo(layerGroup);

      // Bus Stops
      route.stops.forEach((stop) => {
        const isSelected = selectedStop?.id === stop.id;
        const isUserWaiting = userWaitingStop && (userWaitingStop.stopId === stop.id || userWaitingStop.stopName === stop.name);
        const iconHtml = `
          <div class="leafletStopMarker ${isSelected ? 'active' : ''} ${isUserWaiting ? 'waitingActive' : ''}" style="border-color: ${isUserWaiting ? '#10b981' : route.color}">
            <div class="stopDot" style="background: ${isUserWaiting ? '#10b981' : route.color}"></div>
            ${isUserWaiting ? '<span class="waitingPulseRing"></span><span class="userWaitTag">ฉันรอที่นี่</span>' : ''}
          </div>
        `;
        const divIcon = leafletObj.divIcon({
          html: iconHtml,
          className: 'customStopDivIcon',
          iconSize: isUserWaiting ? [26, 26] : [20, 20],
          iconAnchor: isUserWaiting ? [13, 13] : [10, 10]
        });

        const marker = leafletObj.marker([stop.lat, stop.lng], { icon: divIcon }).addTo(layerGroup);
        const tooltipText = isUserWaiting
          ? `<b>${stop.name} (คุณกำลังรอรถที่นี่)</b><br/>สาย ${route.id}`
          : `<b>${stop.name}</b><br/>สาย ${route.id} (${route.name})`;
        marker.bindTooltip(tooltipText, { direction: 'top', offset: [0, -8] });
        marker.on('click', () => setSelectedStop(stop));
      });
    });

    // 2. Render Live Buses Moving Markers
    visibleBuses.forEach((bus) => {
      const route = ROUTES.find((r) => r.id === bus.route);
      const isSelected = selectedBus && selectedBus.id === bus.id;

      let pos = { lat: 8.6445, lng: 99.8970 };
      if (route && route.polyline.length > 0) {
        const idx = bus.progressIndex % route.polyline.length;
        pos = route.polyline[idx];
      }

      const percent = Math.min(100, Math.round(((bus.passengers || 0) / 20) * 100));
      const barColor = percent >= 90 ? '#ef4444' : percent >= 60 ? '#fbbf24' : '#4ade80';

      const busIcon = leafletObj.divIcon({
        className: 'customBusIconMarker',
        html: `
          <div style="
            position: relative;
            background: ${route ? route.color : '#5C068C'};
            color: white;
            padding: 3px 6px 4px;
            border-radius: 10px;
            font-size: 10px;
            font-weight: 800;
            white-space: nowrap;
            box-shadow: 0 3px 10px rgba(0,0,0,0.3);
            border: 1.5px solid white;
            display: flex;
            flex-direction: column;
            gap: 2px;
            cursor: pointer;
            min-width: 72px;
            transition: transform 0.25s ease;
            ${isSelected ? 'transform: scale(1.2); z-index: 999; box-shadow: 0 0 0 4px rgba(92,6,140,0.35);' : ''}
          ">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px; line-height: 1;">
              <span style="font-size: 10px;">${bus.id}</span>
              <span style="font-size: 9px; opacity: 0.9; font-weight: 700;">${Math.min(20, bus.passengers || 0)}/20</span>
            </div>
            <div style="width: 100%; height: 3px; background: rgba(0, 0, 0, 0.3); border-radius: 99px; overflow: hidden;">
              <div style="width: ${percent}%; height: 100%; background: ${barColor}; border-radius: 99px;"></div>
            </div>
          </div>
        `,
        iconSize: [78, 26],
        iconAnchor: [39, 13]
      });

      const busMarker = leafletObj.marker([pos.lat, pos.lng], { icon: busIcon }).addTo(layerGroup);
      busMarker.on('click', () => {
        setSelectedBus(bus);
      });
    });
  }, [visibleRoutes, visibleBuses, selectedBus, selectedStop]);

  return <div ref={containerRef} className="leafletMapCanvas" />;
}
