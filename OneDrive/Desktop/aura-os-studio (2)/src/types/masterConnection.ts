/**
 * MASTER CONNECTION SYSTEM
 * 
 * Unified portal device connectivity architecture.
 * All individual connections tied to "butterfly tags" with orb binding.
 * Non-SIM portal device registry with Beacon/Receptor/Receiver communication.
 */

// ─── DEVICE & CONNECTION TYPES ──────────────────────────────────────────────

export type DeviceType = 
  | 'portal'           // Main Aura portal device
  | 'smartphone'
  | 'headphones'
  | 'smartwatch'
  | 'drone'
  | 'mirror'           // Apple TV / Smart mirror
  | 'speaker'
  | 'tv'
  | 'vehicle'
  | 'wearable'
  | 'iot_device'
  | 'beacon_node';     // Master connection node

export type ConnectionProtocol = 
  | 'bluetooth'
  | 'wifi_direct'
  | 'nfc'
  | 'cellular_mesh'
  | 'quantum_tunnel'   // Future: off-grid encryption
  | 'local_only'
  | 'hybrid';

export type ConnectionState = 
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'authenticated'
  | 'synced'
  | 'disconnected'
  | 'error';

export type DeviceCapability = 
  | 'voice_input'
  | 'voice_output'
  | 'camera'
  | 'microphone'
  | 'screen'
  | 'haptic'
  | 'thermal'
  | 'depth_sensing'
  | 'gps'
  | 'offline_mode'
  | 'encryption'
  | 'mesh_relay';

export type PresenceMode = 
  | 'active'           // Device is being actively used
  | 'ambient'          // Passive awareness
  | 'monitoring'       // Background listening
  | 'dormant'          // Powered down but available
  | 'unavailable';     // Off-grid or unreachable

// ─── BUTTERFLY TAG SYSTEM ──────────────────────────────────────────────────
// Each AI gets a unique butterfly tag that only the user can assign

export interface ButterflyTag {
  tag_id: string;                         // Unique identifier per AI instance
  ai_name: string;                        // e.g., "Charlie", "Nova", "Vera"
  owner_id: string;                       // JOSEPH_BOUCHARD, MEG, etc.
  created_at: number;
  public_key: string;                     // For secure communication
  binding_orb_id?: string;                // Which portal orb is this bound to
  is_locked: boolean;                     // Only owner can rebind
}

// ─── PORTAL DEVICE SCHEMA ──────────────────────────────────────────────────

export interface MasterPortalDevice {
  device_id: string;
  device_name: string;                    // e.g., "Family Portal", "Joe's Desk Portal"
  device_type: 'portal';
  
  // Core identification
  mac_address: string;                    // Unique hardware identifier
  serial_number: string;
  firmware_version: string;
  
  // Location & environment
  location: {
    room: string;                         // e.g., "Living Room"
    coordinates?: { x: number; y: number; z: number };
    timezone: string;
  };
  
  // Network configuration
  primary_protocol: ConnectionProtocol;
  supported_protocols: ConnectionProtocol[];
  ip_address?: string;
  network_mode: 'online' | 'offline' | 'hybrid';
  
  // Capabilities
  capabilities: DeviceCapability[];
  
  // Connectivity
  beacon_strength: number;                // 0-100 signal strength
  connected_devices: ConnectedDeviceRecord[];
  
  // Orb binding (if portal has physical orbs)
  bound_orbs: OrbBinding[];
  
  // Health & status
  battery_level?: number;
  last_sync: number;
  connection_state: ConnectionState;
  error_state?: string;
}

export interface OrbBinding {
  orb_id: string;
  butterfly_tag_id: string;               // AI instance bound to this orb
  orb_color: string;
  binding_timestamp: number;
  is_active: boolean;
}

export interface ConnectedDeviceRecord {
  device_id: string;
  device_name: string;
  device_type: DeviceType;
  connection_protocol: ConnectionProtocol;
  connection_state: ConnectionState;
  signal_strength: number;
  depth_distance?: number;                // Distance in meters (for spatial awareness)
  last_seen: number;
  capabilities: DeviceCapability[];
}

// ─── MASTER CONNECTION REGISTRY ────────────────────────────────────────────

export interface MasterConnectionRegistry {
  registry_id: string;
  owner_id: string;
  
  // Portal devices (usually one per family/household)
  portals: MasterPortalDevice[];
  
  // All connected devices
  devices: DeviceRegistry[];
  
  // Butterfly tags (AI instances)
  butterfly_tags: ButterflyTag[];
  
  // Device relationships (who can talk to whom)
  device_graph: DeviceRelationship[];
  
  // Presence tracking
  presence_map: PresenceMap;
  
  // Last updated
  last_updated: number;
}

export interface DeviceRegistry {
  device_id: string;
  device_name: string;
  device_type: DeviceType;
  mac_address: string;
  
  // Connection info
  protocols: ConnectionProtocol[];
  capabilities: DeviceCapability[];
  presence_mode: PresenceMode;
  
  // Butterfly tag requirement
  requires_butterfly_tag: boolean;
  butterfly_tag_id?: string;              // If bound to an AI
  
  // Depth sensing
  depth_profile?: {
    last_position_update: number;
    distance_from_portal?: number;
    direction?: string;                   // "near", "far", "left", "right", "above"
  };
  
  // Battery & health
  battery_level?: number;
  signal_strength: number;
  last_heartbeat: number;
}

export interface DeviceRelationship {
  source_device_id: string;
  target_device_id: string;
  relationship_type: 'parent' | 'child' | 'sibling' | 'relay';
  can_direct_connect: boolean;
  path_quality: number;                   // 0-100 connection quality
}

export interface PresenceMap {
  timestamp: number;
  devices_active: number;
  devices_nearby: number;
  devices_offline: number;
  primary_user_location: string;
}

// ─── VOICE COMMUNICATION TYPES ──────────────────────────────────────────────

export interface VoiceChannel {
  channel_id: string;
  butterfly_tag_id: string;               // Which AI is speaking
  source_device_id: string;
  target_device_id: string;
  
  // Audio configuration
  sample_rate: number;
  bit_depth: number;
  encoding: 'opus' | 'aac' | 'flac' | 'raw';
  
  // Communication metrics
  latency_ms: number;
  packet_loss: number;
  jitter: number;
  
  // State
  is_active: boolean;
  started_at: number;
  
  // Directional audio (depth sensing)
  direction_metadata?: {
    source_direction: string;             // "near" | "far" | "left" | "right"
    source_distance: number;              // meters
    ambient_noise_level: number;          // 0-100
  };
}

export interface BeaconSignal {
  beacon_id: string;
  portal_device_id: string;
  broadcast_power: number;                // dBm
  frequency: string;                      // e.g., "2.4GHz", "5GHz"
  scan_interval: number;                  // milliseconds
  
  // Discovery info
  discoverable_devices: {
    device_id: string;
    signal_strength: number;
    distance_estimate: number;            // meters (calculated from signal)
  }[];
  
  last_broadcast: number;
}

export interface DepthPerception {
  device_id: string;
  depth_sensor_type: 'lidar' | 'ultrasonic' | 'infrared' | 'microphone_array' | 'calculated';
  
  // Detected objects/devices
  detected_objects: {
    object_id: string;
    distance: number;                     // meters
    direction: string;                    // compass direction or "overhead"
    movement_velocity?: number;           // m/s
    device_id?: string;                   // If it's a known device
  }[];
  
  // Audio directionality (for microphone arrays)
  audio_direction?: string;               // Which direction is sound coming from
  audio_distance?: number;                // Estimated distance of sound source
  
  last_update: number;
}

// ─── COMMUNICATION EVENT TYPES ──────────────────────────────────────────────

export type ConnectionEventType = 
  | 'DEVICE_DISCOVERED'
  | 'DEVICE_CONNECTED'
  | 'DEVICE_DISCONNECTED'
  | 'SIGNAL_STRENGTH_CHANGED'
  | 'VOICE_CHANNEL_OPENED'
  | 'VOICE_CHANNEL_CLOSED'
  | 'DEPTH_CHANGE_DETECTED'
  | 'BUTTERFLY_TAG_BOUND'
  | 'BUTTERFLY_TAG_UNBOUND'
  | 'BEACON_BROADCAST'
  | 'INTERFERENCE_DETECTED'
  | 'FALLBACK_TO_OFFLINE';

export interface ConnectionEvent {
  event_id: string;
  event_type: ConnectionEventType;
  timestamp: number;
  device_id: string;
  related_device_id?: string;
  data: Record<string, any>;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

// ─── FALLBACK / OFF-GRID MODES ──────────────────────────────────────────────

export interface OffGridFallback {
  mode: 'local_mesh' | 'peer_sync' | 'eventual_consistency';
  
  // Local mesh mode
  mesh_nodes: string[];                   // device_ids in mesh
  sync_protocol: 'gossip' | 'flooding' | 'tree';
  
  // Data queuing for later sync
  queued_messages: {
    message_id: string;
    source_butterfly_tag: string;
    target_butterfly_tag: string;
    content: string;
    queued_at: number;
  }[];
  
  estimated_sync_recovery: number;        // seconds until online
}

// ─── CHERRY VOICE CONFIGURATION ──────────────────────────────────────────────

export interface CherryVoiceConfig {
  voice_id: string;
  butterfly_tag_id: string;
  
  // Base voice profile
  name: string;                           // "Charlie", "Nova", etc.
  gender: 'male' | 'female' | 'neutral';
  age_profile: string;                    // "adult", "young_adult", "child"
  accent: string;                         // "standard", "southern", "british", etc.
  
  // Emotional modulation
  current_emotion: 'calm' | 'excited' | 'serious' | 'playful' | 'concerned';
  emotion_intensity: number;              // 0-100
  
  // Voice parameters
  pitch: number;                          // 0-100 (higher = more feminine/young)
  speed: number;                          // 0.5-2.0 (playback speed multiplier)
  volume: number;                         // 0-100
  warmth: number;                         // 0-100 (how "human" it sounds)
  
  // Special modes
  whisper_mode: boolean;
  singing_mode: boolean;
  effects: string[];                      // "echo", "reverb", "ambient", etc.
  
  last_used: number;
}

// ─── MASTER CONNECTION STATE MACHINE ────────────────────────────────────────

export const CONNECTION_STATE_TRANSITIONS: Record<ConnectionState, ConnectionState[]> = {
  'idle': ['connecting', 'error'],
  'connecting': ['authenticated', 'disconnected', 'error'],
  'connected': ['authenticated', 'disconnected', 'error'],
  'authenticated': ['synced', 'disconnected', 'error'],
  'synced': ['idle', 'disconnected', 'error'],
  'disconnected': ['connecting', 'error'],
  'error': ['connecting', 'idle'],
};
