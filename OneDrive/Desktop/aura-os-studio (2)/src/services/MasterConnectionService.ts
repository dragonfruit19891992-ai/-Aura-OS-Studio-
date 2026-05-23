/**
 * MASTER CONNECTION SERVICE
 * 
 * Unified device connectivity coordination.
 * Manages portal, all connected devices, butterfly tags, and communication.
 */

import type {
  MasterPortalDevice,
  MasterConnectionRegistry,
  DeviceRegistry,
  ButterflyTag,
  VoiceChannel,
  ConnectionEvent,
  ConnectionState,
  ConnectionEventType,
  PresenceMode,
  OffGridFallback,
} from '../types/masterConnection';

export class MasterConnectionService {
  private registry: MasterConnectionRegistry | null = null;
  private eventLog: ConnectionEvent[] = [];
  private voiceChannels: Map<string, VoiceChannel> = new Map();
  private offGridMode: OffGridFallback | null = null;

  /**
   * Initialize Master Connection Registry
   */
  public async initializeRegistry(
    ownerId: string,
    portalConfig: Partial<MasterPortalDevice>
  ): Promise<MasterConnectionRegistry> {
    this.registry = {
      registry_id: `registry_${ownerId}_${Date.now()}`,
      owner_id: ownerId,
      portals: [],
      devices: [],
      butterfly_tags: [],
      device_graph: [],
      presence_map: {
        timestamp: Date.now(),
        devices_active: 0,
        devices_nearby: 0,
        devices_offline: 0,
        primary_user_location: 'unknown',
      },
      last_updated: Date.now(),
    };

    // Register primary portal
    if (portalConfig) {
      this.registerPortal(ownerId, portalConfig);
    }

    return this.registry;
  }

  /**
   * Register a portal device
   */
  public registerPortal(
    ownerId: string,
    config: Partial<MasterPortalDevice>
  ): MasterPortalDevice {
    if (!this.registry) {
      throw new Error('Registry not initialized');
    }

    const portal: MasterPortalDevice = {
      device_id: `portal_${Date.now()}`,
      device_name: config.device_name || 'Family Portal',
      device_type: 'portal',
      mac_address: config.mac_address || this.generateMacAddress(),
      serial_number: config.serial_number || `SN_${Date.now()}`,
      firmware_version: config.firmware_version || '1.0.0',
      location: config.location || {
        room: 'Living Room',
        timezone: 'UTC',
      },
      primary_protocol: config.primary_protocol || 'wifi_direct',
      supported_protocols: config.supported_protocols || ['wifi_direct', 'bluetooth', 'nfc'],
      capabilities: config.capabilities || [
        'voice_input',
        'voice_output',
        'camera',
        'screen',
        'haptic',
        'depth_sensing',
        'mesh_relay',
      ],
      connected_devices: [],
      bound_orbs: [],
      battery_level: 100,
      last_sync: Date.now(),
      connection_state: 'idle',
    };

    this.registry.portals.push(portal);
    this.logEvent('DEVICE_DISCOVERED', portal.device_id, {
      device_type: 'portal',
      mac: portal.mac_address,
    });

    return portal;
  }

  /**
   * Register a connected device
   */
  public registerDevice(device: Partial<DeviceRegistry>): DeviceRegistry {
    if (!this.registry) {
      throw new Error('Registry not initialized');
    }

    const registered: DeviceRegistry = {
      device_id: device.device_id || `device_${Date.now()}`,
      device_name: device.device_name || 'Unknown Device',
      device_type: device.device_type || 'smartphone',
      mac_address: device.mac_address || this.generateMacAddress(),
      protocols: device.protocols || ['bluetooth'],
      capabilities: device.capabilities || [],
      presence_mode: device.presence_mode || 'dormant',
      requires_butterfly_tag: device.requires_butterfly_tag ?? false,
      battery_level: device.battery_level ?? 75,
      signal_strength: device.signal_strength ?? 0,
      last_heartbeat: Date.now(),
    };

    this.registry.devices.push(registered);
    this.logEvent('DEVICE_DISCOVERED', registered.device_id, {
      device_type: registered.device_type,
    });

    return registered;
  }

  /**
   * Register a butterfly tag (AI instance)
   */
  public registerButterflyTag(
    aiName: string,
    ownerId: string,
    publicKey: string
  ): ButterflyTag {
    if (!this.registry) {
      throw new Error('Registry not initialized');
    }

    const tag: ButterflyTag = {
      tag_id: `tag_${aiName}_${ownerId}_${Date.now()}`,
      ai_name: aiName,
      owner_id: ownerId,
      created_at: Date.now(),
      public_key: publicKey,
      is_locked: true,
    };

    this.registry.butterfly_tags.push(tag);
    this.logEvent('BUTTERFLY_TAG_BOUND', tag.tag_id, {
      ai_name: aiName,
      owner_id: ownerId,
    });

    return tag;
  }

  /**
   * Open a voice channel between two devices
   */
  public openVoiceChannel(
    butterflyTagId: string,
    sourceDeviceId: string,
    targetDeviceId: string,
    protocol: 'voice_call' | 'voice_stream'
  ): VoiceChannel {
    const channel: VoiceChannel = {
      channel_id: `vc_${Date.now()}`,
      butterfly_tag_id: butterflyTagId,
      source_device_id: sourceDeviceId,
      target_device_id: targetDeviceId,
      sample_rate: 48000,
      bit_depth: 16,
      encoding: 'opus',
      latency_ms: 0,
      packet_loss: 0,
      jitter: 0,
      is_active: true,
      started_at: Date.now(),
    };

    this.voiceChannels.set(channel.channel_id, channel);
    this.logEvent('VOICE_CHANNEL_OPENED', sourceDeviceId, {
      channel_id: channel.channel_id,
      target: targetDeviceId,
    });

    return channel;
  }

  /**
   * Close a voice channel
   */
  public closeVoiceChannel(channelId: string): boolean {
    const channel = this.voiceChannels.get(channelId);
    if (channel) {
      channel.is_active = false;
      this.logEvent('VOICE_CHANNEL_CLOSED', channel.source_device_id, {
        channel_id: channelId,
        duration_ms: Date.now() - channel.started_at,
      });
      return true;
    }
    return false;
  }

  /**
   * Update device connection state
   */
  public updateDeviceState(
    deviceId: string,
    newState: ConnectionState,
    metadata?: Record<string, any>
  ): DeviceRegistry | null {
    if (!this.registry) return null;

    const device = this.registry.devices.find(d => d.device_id === deviceId);
    if (!device) return null;

    device.last_heartbeat = Date.now();

    // Update presence mode based on state
    if (newState === 'connected' || newState === 'authenticated' || newState === 'synced') {
      device.presence_mode = 'active';
    } else if (newState === 'disconnected') {
      device.presence_mode = 'unavailable';
    }

    this.logEvent('DEVICE_CONNECTED', deviceId, {
      state: newState,
      metadata,
    });

    return device;
  }

  /**
   * Activate offline/mesh mode
   */
  public activateOffGridMode(meshNodeIds: string[]): OffGridFallback {
    this.offGridMode = {
      mode: 'local_mesh',
      mesh_nodes: meshNodeIds,
      sync_protocol: 'gossip',
      queued_messages: [],
      estimated_sync_recovery: 300000, // 5 minutes
    };

    this.logEvent('FALLBACK_TO_OFFLINE', 'system', {
      mesh_nodes: meshNodeIds.length,
      protocol: 'local_mesh',
    });

    return this.offGridMode;
  }

  /**
   * Queue a message for later delivery (when offline)
   */
  public queueMessage(
    fromTag: string,
    toTag: string,
    content: string
  ): { message_id: string; queued: boolean } {
    if (!this.offGridMode) {
      return { message_id: '', queued: false };
    }

    const messageId = `msg_${Date.now()}`;
    this.offGridMode.queued_messages.push({
      message_id: messageId,
      source_butterfly_tag: fromTag,
      target_butterfly_tag: toTag,
      content,
      queued_at: Date.now(),
    });

    return { message_id: messageId, queued: true };
  }

  /**
   * Get all connected devices
   */
  public getConnectedDevices(): DeviceRegistry[] {
    if (!this.registry) return [];
    return this.registry.devices.filter(d => d.presence_mode === 'active');
  }

  /**
   * Get device by ID
   */
  public getDevice(deviceId: string): DeviceRegistry | null {
    if (!this.registry) return null;
    return this.registry.devices.find(d => d.device_id === deviceId) || null;
  }

  /**
   * Get butterfly tag by ID
   */
  public getButterflyTag(tagId: string): ButterflyTag | null {
    if (!this.registry) return null;
    return this.registry.butterfly_tags.find(t => t.tag_id === tagId) || null;
  }

  /**
   * Bind butterfly tag to orb
   */
  public bindButterflyToOrb(
    butterflyTagId: string,
    orbId: string,
    orbColor: string = '#00FF00'
  ): { success: boolean; message: string } {
    if (!this.registry || !this.registry.portals[0]) {
      return { success: false, message: 'No portal available' };
    }

    const portal = this.registry.portals[0];
    const tag = this.registry.butterfly_tags.find(t => t.tag_id === butterflyTagId);

    if (!tag) {
      return { success: false, message: 'Butterfly tag not found' };
    }

    const orb = {
      orb_id: orbId,
      butterfly_tag_id: butterflyTagId,
      orb_color: orbColor,
      binding_timestamp: Date.now(),
      is_active: true,
    };

    portal.bound_orbs.push(orb);
    tag.binding_orb_id = orbId;

    this.logEvent('BUTTERFLY_TAG_BOUND', orbId, {
      tag_id: butterflyTagId,
      ai_name: tag.ai_name,
    });

    return { success: true, message: 'Butterfly tag bound to orb' };
  }

  /**
   * Get presence map
   */
  public getPresenceMap() {
    if (!this.registry) return null;

    const active = this.registry.devices.filter(d => d.presence_mode === 'active').length;
    const nearby = this.registry.devices.filter(d => d.presence_mode === 'ambient').length;
    const offline = this.registry.devices.filter(d => d.presence_mode === 'unavailable').length;

    return {
      ...this.registry.presence_map,
      devices_active: active,
      devices_nearby: nearby,
      devices_offline: offline,
      timestamp: Date.now(),
    };
  }

  /**
   * Log connection event
   */
  private logEvent(
    eventType: ConnectionEventType,
    deviceId: string,
    data: Record<string, any>
  ): void {
    const event: ConnectionEvent = {
      event_id: `evt_${Date.now()}`,
      event_type: eventType,
      timestamp: Date.now(),
      device_id: deviceId,
      data,
      severity: 'info',
    };

    this.eventLog.push(event);
  }

  /**
   * Generate MAC address
   */
  private generateMacAddress(): string {
    return 'XX:XX:XX:XX:XX:XX'.replace(/X/g, () =>
      '0123456789ABCDEF'[Math.floor(Math.random() * 16)]
    );
  }

  /**
   * Get event log
   */
  public getEventLog(): ConnectionEvent[] {
    return this.eventLog;
  }

  /**
   * Get current registry state
   */
  public getRegistry(): MasterConnectionRegistry | null {
    return this.registry;
  }
}

// ─── SINGLETON INSTANCE ──────────────────────────────────────────────────────

let service: MasterConnectionService | null = null;

export function getMasterConnectionService(): MasterConnectionService {
  if (!service) {
    service = new MasterConnectionService();
  }
  return service;
}
