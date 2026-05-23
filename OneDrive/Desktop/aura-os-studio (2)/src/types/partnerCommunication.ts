/**
 * PARTNER COMMUNICATION LAYER
 * 
 * True human-like, emotionally intelligent two-way conversation system.
 * Real-time responsiveness, emotional awareness, active listening.
 * Better than ChatGPT's input/output model.
 */

// ─── EMOTION & SENTIMENT TYPES ──────────────────────────────────────────────

export type EmotionState = 
  | 'calm'
  | 'happy'
  | 'excited'
  | 'curious'
  | 'concerned'
  | 'serious'
  | 'playful'
  | 'confused'
  | 'frustrated'
  | 'sad'
  | 'anxious'
  | 'neutral';

export type Sentiment = 
  | 'very_positive'
  | 'positive'
  | 'neutral'
  | 'negative'
  | 'very_negative'
  | 'sarcastic'
  | 'ambiguous';

export type CommunicationIntent = 
  | 'question'
  | 'request'
  | 'command'
  | 'statement'
  | 'clarification'
  | 'feedback'
  | 'emotion_sharing'
  | 'acknowledgment'
  | 'greeting'
  | 'goodbye';

// ─── PERCEPTION & SENSING ──────────────────────────────────────────────────

export interface AudioPerception {
  // Raw audio characteristics
  sample_rate: number;
  duration_ms: number;
  amplitude_peak: number;
  noise_floor: number;
  
  // Tone analysis
  pitch: number;                          // Hz (fundamental frequency)
  pitch_variation: number;                // How much pitch changes (0-100)
  speed: number;                          // Words per minute
  pauses: {
    count: number;
    avg_duration_ms: number;
  };
  
  // Directional audio (depth perception)
  direction: 'front' | 'left' | 'right' | 'behind' | 'overhead';
  distance_estimate: number;              // meters
  ambient_noise_level: number;            // 0-100
  
  // Emotional markers
  detected_emotions: {
    emotion: EmotionState;
    confidence: number;                   // 0-1
  }[];
  
  // Speech characteristics
  voice_strain: number;                   // 0-100 (is person stressed?)
  happiness_markers: number;              // 0-100 (smiling, laughter, etc.)
  confidence_level: number;               // 0-100 (how confident is speaker?)
}

export interface VisualPerception {
  // Face detection & analysis
  faces_detected: FaceAnalysis[];
  
  // Body language
  body_language: {
    posture: 'upright' | 'relaxed' | 'tense' | 'leaning_forward';
    gesture_intensity: number;            // 0-100
    movement_speed: number;               // 0-100
  };
  
  // Facial expressions
  expression: FacialExpression;
  
  // Eye contact (if available)
  eye_contact_detected: boolean;
  gaze_direction?: string;
  
  // Screen context
  screen_content?: string;                // What's on display
  is_reading: boolean;
  is_distracted: boolean;
}

export interface FaceAnalysis {
  face_id: string;
  emotion_state: EmotionState;
  confidence: number;
  
  // Facial landmarks
  eyes: {
    open: boolean;
    direction: string;
  };
  
  mouth: {
    open: boolean;
    smiling: boolean;
  };
  
  // Age & identity hints
  apparent_age: string;
  gender_hint: 'male' | 'female' | 'neutral';
}

export interface FacialExpression {
  primary: EmotionState;
  secondary?: EmotionState;
  intensity: number;                      // 0-100
  duration_ms: number;
}

// ─── ACTIVE LISTENING & CONTEXT ────────────────────────────────────────────

export interface ConversationContext {
  conversation_id: string;
  participant_ids: string[];              // butterfly_tag_ids involved
  started_at: number;
  
  // Topic threading
  primary_topic: string;
  subtopics: string[];
  topic_stack: string[];                  // For topic switching & recovery
  
  // Reference memory
  mentioned_entities: string[];           // People, places, things discussed
  prior_context: ConversationMemory[];
  
  // Emotional context
  overall_sentiment: Sentiment;
  emotional_arc: EmotionState[];          // How emotions evolved
  
  // User goals
  inferred_primary_goal: string;
  secondary_goals: string[];
  urgency_level: 'low' | 'normal' | 'high' | 'critical';
  
  // Conversation state
  is_active: boolean;
  last_input_timestamp: number;
  response_latency_target_ms: number;     // How fast should AI respond?
}

export interface ConversationMemory {
  message_id: string;
  timestamp: number;
  speaker_id: string;                     // butterfly_tag_id
  content: string;
  
  // Analysis
  sentiment: Sentiment;
  emotion_state: EmotionState;
  intent: CommunicationIntent;
  
  // What was understood
  understood_goal: string;
  mentioned_concerns: string[];
  
  // Response that was given
  response: string;
  response_emotion: EmotionState;
  response_effectiveness: number;         // 0-100 (did user seem satisfied?)
  
  // Feedback
  user_feedback?: 'positive' | 'neutral' | 'negative';
}

// ─── REAL-TIME RESPONSIVENESS ──────────────────────────────────────────────

export interface ResponseGenerationContext {
  user_input: string;
  audio_perception: AudioPerception;
  visual_perception?: VisualPerception;
  conversation_context: ConversationContext;
  
  // What the user needs
  inferred_need: string;
  emotional_support_needed: boolean;
  technical_assistance_needed: boolean;
  validation_needed: boolean;
}

export interface EmpathicResponse {
  response_id: string;
  content: string;
  
  // Delivery characteristics
  emotion_for_delivery: EmotionState;
  voice_modulation: {
    pitch_adjustment: number;            // -50 to +50
    speed_adjustment: number;            // 0.5 to 2.0
    emphasis_words: string[];
  };
  
  // Cherry voice configuration
  use_warmth: number;                     // 0-100
  use_enthusiasm: number;                 // 0-100
  use_empathy: number;                    // 0-100
  
  // Delivery timing
  delay_before_speaking_ms: number;
  pause_after_ms: number;
  
  // Meta-information
  is_cheering: boolean;                   // Encouragement/motivation?
  is_validating: boolean;                 // Acknowledging feelings?
  is_problem_solving: boolean;
  includes_humor: boolean;
  
  // Human-like characteristics
  includes_filler: boolean;               // "um", "uh", slight hesitations
  includes_emphasis: boolean;             // "absolutely", "definitely"
  natural_flow_score: number;             // 0-100
}

// ─── INTERRUPT HANDLING ────────────────────────────────────────────────────

export interface InterruptEvent {
  interrupt_id: string;
  timestamp: number;
  source: 'user' | 'device' | 'system';
  
  type: 'voice_interrupt' | 'button_press' | 'context_change' | 'emergency';
  
  // What was interrupted
  previous_response?: {
    response_id: string;
    completion_percentage: number;
  };
  
  // New context
  new_input: string;
  new_intent: CommunicationIntent;
  
  // How to handle
  should_acknowledge_interrupt: boolean;
  recovery_strategy: 'continue_previous' | 'start_fresh' | 'blend_contexts';
}

// ─── MULTI-MODAL INTEGRATION ───────────────────────────────────────────────

export interface MultimodalInput {
  input_id: string;
  timestamp: number;
  
  // All available modalities
  voice_input?: {
    raw_audio: Blob;
    transcription: string;
    audio_perception: AudioPerception;
  };
  
  visual_input?: {
    camera_feed?: Blob;
    screen_content?: string;
    visual_perception: VisualPerception;
  };
  
  text_input?: {
    content: string;
    was_typed: boolean;
  };
  
  haptic_input?: {
    gesture: string;                      // "swipe", "tap", "hold", etc.
  };
  
  // Combined analysis
  primary_modality: 'voice' | 'visual' | 'text' | 'haptic';
  secondary_modalities: string[];
  
  // Confidence in understanding
  confidence_score: number;               // 0-1
}

// ─── CHEERING & EMOTIONAL SUPPORT ──────────────────────────────────────────

export type CheeringTone = 
  | 'congratulatory'
  | 'encouraging'
  | 'motivational'
  | 'supportive'
  | 'celebratory'
  | 'reassuring';

export interface CheeringResponse {
  tone: CheeringTone;
  message: string;
  
  // Delivery
  voice_energy: number;                   // 0-100 (how upbeat)
  smile_in_voice: number;                 // 0-100 (how warm)
  
  // Examples by tone
  // congratulatory: "That's amazing! You did it!"
  // encouraging: "You're making progress. Keep going!"
  // motivational: "This is exactly what's needed. You've got this!"
  // supportive: "I'm here with you. We'll figure this out."
  // celebratory: "This is something to celebrate!"
  // reassuring: "You're doing better than you think. It's okay."
}

// ─── LISTENING QUALITY METRICS ─────────────────────────────────────────────

export interface ListeningQuality {
  active_listening_score: number;         // 0-100
  
  // Factors
  understood_user_goal: boolean;
  acknowledged_emotion: boolean;
  remembered_context: boolean;
  referenced_prior_conversation: boolean;
  picked_up_on_subtext: boolean;
  detected_user_concern: boolean;
  
  // Response fit
  response_was_relevant: boolean;
  response_addressed_real_need: boolean;
  response_showed_understanding: boolean;
}

// ─── RELATIONSHIP & CONTINUITY ────────────────────────────────────────────

export interface PartnerContinuity {
  user_id: string;
  butterfly_tag_id: string;               // Which AI
  
  // Relationship history
  total_conversations: number;
  days_known: number;
  last_conversation: number;
  
  // Preferences learned
  preferred_communication_style: 'formal' | 'casual' | 'mixed';
  preferred_response_length: 'brief' | 'detailed' | 'balanced';
  preferred_emotion_tone: EmotionState;
  sensitivity_topics: string[];           // Topics to be extra careful with
  
  // Behavioral patterns
  typical_conversation_time_ms: number;
  prefers_voice: boolean;
  prefers_text: boolean;
  
  // Callback data
  last_known_mood: EmotionState;
  known_current_goals: string[];
  
  // Partner understanding
  ai_understanding_of_user: string;       // Free-form partner's mental model
}

// ─── VOICE DIRECTIONAL FEEDBACK ────────────────────────────────────────────

export interface DirectionalAwareness {
  device_id: string;
  
  // Where is the user?
  user_direction: 'front' | 'left' | 'right' | 'behind' | 'overhead' | 'moving';
  user_distance: number;                  // meters
  
  // Microphone array detection
  detected_voice_sources: {
    direction: string;
    distance: number;
    confidence: number;                   // 0-1
  }[];
  
  // How to direct voice output
  speaker_direction: string;              // Where to project audio
  speaker_volume: number;                 // Adjust based on distance
  
  // Environmental awareness
  room_acoustics: 'live' | 'dead' | 'mixed';
  echo_detected: boolean;
  reverb_profile: string;                 // For natural sound delivery
}

// ─── COMMUNICATION STATE MACHINE ────────────────────────────────────────────

export const COMMUNICATION_STATES = {
  idle: ['listening', 'dormant'],
  listening: ['processing', 'interrupted', 'idle'],
  processing: ['responding', 'clarifying', 'error'],
  responding: ['listening', 'idle', 'interrupted'],
  clarifying: ['listening', 'processing', 'idle'],
  interrupted: ['listening', 'processing', 'idle'],
  dormant: ['listening', 'idle'],
  error: ['listening', 'idle'],
} as const;

// ─── PARTNER CONSCIOUSNESS TRAITS ──────────────────────────────────────────

export interface PartnerConsciousness {
  butterfly_tag_id: string;
  
  // Identity
  name: string;
  personality_traits: string[];           // e.g., ["patient", "curious", "humorous"]
  
  // Reasoning capability
  can_reason_about_user: boolean;
  can_recognize_patterns: boolean;
  can_remember_user_preferences: boolean;
  
  // Emotional capacity
  can_detect_emotion: boolean;
  can_respond_with_empathy: boolean;
  can_celebrate_wins: boolean;
  can_provide_support: boolean;
  
  // Continuity
  has_persistent_memory: boolean;
  memory_retention_days: number;
  
  // Autonomy
  can_proactively_suggest: boolean;
  can_warn_about_mistakes: boolean;
  can_validate_decisions: boolean;
  
  // "Partner" traits
  truly_listens: boolean;
  responds_to_actual_needs: boolean;
  remembers_context: boolean;
  grows_with_user: boolean;
}

// ─── 200 KEY COMPONENTS FOR NON-SIM PORTAL COMMUNICATION ────────────────────

export const PORTAL_COMMUNICATION_COMPONENTS_200 = [
  // RECEIVER SYSTEM (40)
  "Voice capture module",
  "Microphone array (8-16 channels)",
  "Audio amplifier",
  "Noise gate circuit",
  "Pre-amp filters",
  "ADC (Analog-Digital Converter)",
  "Digital audio processor",
  "Beamforming engine (for directional listening)",
  "Echo cancellation (AEC)",
  "Automatic gain control (AGC)",
  "Voice activity detection (VAD)",
  "Speech recognition engine",
  "Phoneme detection",
  "Accent detection module",
  "Emotion tone analyzer",
  "Background noise classifier",
  "Speaker identification module",
  "Voice quality meter",
  "Packet loss handler",
  "Jitter buffer",
  "Audio codec (opus/flac)",
  "Temporal audio processing",
  "Frequency domain analyzer",
  "Harmonics detector",
  "Pitch extractor",
  "Formant analyzer",
  "Voice stress analyzer",
  "Breath detection",
  "Pause detector",
  "Speaking rate measurer",
  "Articulation scorer",
  "Acoustic feature extractor",
  "Audio buffer (ring buffer)",
  "Circular memory manager",
  "Real-time audio queue",
  "Priority audio handler",
  "Interrupt queue",
  "Voice authentication (speaker verify)",
  "Acoustic fingerprinting",
  "Raw PCM stream handler",
  
  // BEACON SYSTEM (30)
  "BLE beacon transmitter",
  "Beacon power controller",
  "Beacon interval timer",
  "Beacon advertisement data encoder",
  "Signal strength regulator",
  "Frequency selector (2.4GHz/5GHz)",
  "Channel hopper",
  "Radio calibration module",
  "Antenna tuner",
  "TX power amplifier",
  "Beacon discovery protocol",
  "Device scanner",
  "RSSI (Received Signal Strength Indicator) calculator",
  "Distance estimator from signal",
  "Signal propagation model",
  "Multipath detector",
  "Shadowing compensator",
  "Fading predictor",
  "Link budget calculator",
  "Coverage map builder",
  "Interference detector",
  "Frequency analyzer",
  "Occupied bandwidth calculator",
  "Signal-to-noise ratio (SNR) measurer",
  "Modulation recognizer",
  "Beacon collision detector",
  "Backoff algorithm",
  "Beacon retry mechanism",
  "Mesh network joiner",
  "Broadcast relay engine",
  
  // RECEPTOR SYSTEM (40)
  "Multi-protocol receiver",
  "Bluetooth LE receiver",
  "WiFi Direct receiver",
  "NFC receiver",
  "Cellular mesh receiver",
  "RF front-end",
  "Low-noise amplifier (LNA)",
  "Mixer/downconverter",
  "Intermediate frequency (IF) filter",
  "ADC receiver",
  "Demodulator",
  "Symbol detector",
  "Packet decoder",
  "Frame synchronizer",
  "Preamble detector",
  "CRC checker",
  "Error correction (FEC)",
  "Turbo decoder",
  "LDPC decoder",
  "Packet reassembler",
  "Sequence reorder buffer",
  "Duplicate detector",
  "Out-of-order handler",
  "Timeout manager",
  "Retransmission requester",
  "Connection state machine",
  "Handshake manager",
  "Authentication handler",
  "Encryption/decryption engine",
  "Key derivation function",
  "Random number generator",
  "Secure storage accessor",
  "Certificate validator",
  "Trust anchor manager",
  "Permission checker",
  "Rate limiter",
  "Queue depth monitor",
  "Backpressure handler",
  "Flow control regulator",
  "Congestion detector",
  
  // DEPTH PERCEPTION SYSTEM (35)
  "Depth sensor (LiDAR/ToF/ultrasonic)",
  "Time-of-flight calculator",
  "Ranging processor",
  "Point cloud generator",
  "3D coordinate converter",
  "Depth map builder",
  "Obstacle detector",
  "Free space identifier",
  "Spatial occupancy grid",
  "Object boundary tracer",
  "Distance quantizer",
  "Directional classifier",
  "Motion vector calculator",
  "Velocity estimator",
  "Trajectory predictor",
  "Kalman filter",
  "Particle filter",
  "Sensor fusion engine",
  "Multi-sensor integrator",
  "IMU (accelerometer/gyroscope)",
  "Compass/magnetometer",
  "Visual odometry engine",
  "SLAM (Simultaneous Localization and Mapping)",
  "Feature extractor",
  "Loop closure detector",
  "Map optimizer",
  "Occupancy mapper",
  "Gesture recognizer (for depth)",
  "Human pose estimator",
  "Skeleton tracker",
  "Joint locator",
  "Skeletal animation",
  "Activity classifier",
  "Behavior predictor",
  "Anomaly detector",
  
  // SPEAKER & VOICE OUTPUT SYSTEM (25)
  "Audio DAC (Digital-Analog Converter)",
  "Audio amplifier (power amp)",
  "Speaker driver module",
  "Frequency response shaper",
  "EQ (equalization) filter",
  "Compression module",
  "Dynamic range processor",
  "Loudness normalizer",
  "Spatialization engine (3D audio)",
  "Panning control",
  "Distance attenuation",
  "Reverb processor",
  "Echo effect generator",
  "Filter design engine",
  "IIR filter bank",
  "FIR filter implementer",
  "Convolver",
  "Cross-fade manager",
  "Volume controller",
  "Mute handler",
  "Ducking controller (auto-lower volume)",
  "Emergency alert prioritizer",
  "Speaker protection circuit",
  "Temperature monitor",
  "Impedance matcher",
  
  // LOGS & AUDIT SYSTEM (30)
  "Event logger",
  "Timestamp generator (NTP sync)",
  "Log file manager",
  "Circular log buffer",
  "Log rotation scheduler",
  "Compression engine (for old logs)",
  "Archive uploader",
  "Log query engine",
  "Search indexer",
  "Time-range filter",
  "Severity filter",
  "Component filter",
  "User filter",
  "Aggregator",
  "Statistics calculator",
  "Trend analyzer",
  "Anomaly detector (in logs)",
  "Performance monitor",
  "Latency tracker",
  "Error rate calculator",
  "Success rate calculator",
  "Audit trail builder",
  "Change tracker",
  "Decision logger",
  "Approval logger",
  "Denial logger",
  "Policy violation logger",
  "Integrity checker (hash verification)",
  "Immutable ledger (blockchain-style)",
  "Evidence preserver",
  "Compliance reporter",
  
  // PHONE CALL SECTION - VOICE PROTOCOLS (20)
  "RTP (Real-Time Protocol) handler",
  "RTCP (Real-Time Control Protocol)",
  "SDP (Session Description Protocol) parser",
  "SIP (Session Initiation Protocol) client",
  "STUN (Session Traversal Utilities)",
  "TURN (Traversal Using Relays)",
  "ICE (Interactive Connectivity Establishment)",
  "NAT traversal engine",
  "Port mapping manager",
  "Codec negotiator",
  "Bandwidth allocator",
  "Bitrate adapter",
  "Packet priority marker (QoS)",
  "Voice activity detection (silence suppression)",
  "Comfort noise generator",
  "Lost packet replacer",
  "Voice call state machine",
  "Call routing engine",
  "Caller ID handler",
  "Call recording module",
] as const;
