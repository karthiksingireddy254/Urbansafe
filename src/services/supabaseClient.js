// UrbanSafe AI - Supabase Database Client & Fallback Adapter
// Provides seamless connectivity to Supabase if configured, or gracefully falls back to centralized demo dataset.

import { ACCIDENT_DEMO_LOCATIONS, DEMO_CLUSTERS_DBSCAN } from '../data/accidentDemoData.js';

class SupabaseService {
  constructor() {
    this.url = null;
    this.key = null;
    this.client = null;
    this.init();
  }

  init() {
    try {
      if (typeof localStorage !== 'undefined') {
        this.url = localStorage.getItem('urbansafe_supabase_url') || null;
        this.key = localStorage.getItem('urbansafe_supabase_key') || null;
      }
      if (this.url && this.key && typeof window !== 'undefined' && window.supabase) {
        this.client = window.supabase.createClient(this.url, this.key);
      }
    } catch (e) {
      console.warn('Supabase initialization fallback active:', e.message);
    }
  }

  isConfigured() {
    return !!(this.url && this.key && this.client);
  }

  /**
   * Fetch accident & risk locations
   */
  async getRiskLocations() {
    if (this.isConfigured()) {
      try {
        const { data, error } = await this.client
          .from('risk_locations')
          .select('*')
          .limit(100);

        if (!error && Array.isArray(data) && data.length > 0) {
          return data.map(item => ({
            id: item.id || `LOC_${item.location_name?.replace(/\s+/g, '_')}`,
            name: item.location_name || item.name || 'Urban Corridor',
            latitude: Number(item.latitude || item.lat),
            longitude: Number(item.longitude || item.lng),
            historicalRisk: Number(item.risk_score || item.historical_risk || 50),
            riskLevel: item.risk_level || (item.risk_score >= 70 ? 'HIGH' : item.risk_score >= 40 ? 'MEDIUM' : 'LOW'),
            historicalAccidents: Number(item.accident_count || item.historical_accidents || 10),
            trafficDensity: item.traffic || item.traffic_density || 'Medium',
            weather: item.weather || 'Clear',
            roadCondition: item.road_condition || 'Moderate',
            visibility: Number(item.visibility || 6.0),
            hotspotStatus: Boolean(item.hotspot || item.hotspot_status || item.is_hotspot),
            riskFactors: item.risk_factors || [],
            primaryCause: item.primary_cause || 'Urban corridor traffic conflict',
            preventionRecommendation: item.prevention_recommendation || 'Maintain speed advisory and caution.'
          }));
        }
      } catch (err) {
        console.warn('Supabase query error, falling back to demo dataset:', err.message);
      }
    }

    // Default Fallback
    return [...ACCIDENT_DEMO_LOCATIONS];
  }

  /**
   * Fetch Hotspots and Clusters
   */
  async getHotspots() {
    if (this.isConfigured()) {
      try {
        const { data, error } = await this.client
          .from('hotspots')
          .select('*');

        if (!error && Array.isArray(data) && data.length > 0) {
          return data;
        }
      } catch (err) {
        console.warn('Supabase hotspots query error:', err.message);
      }
    }
    return [...DEMO_CLUSTERS_DBSCAN];
  }
}

export const supabaseService = new SupabaseService();
