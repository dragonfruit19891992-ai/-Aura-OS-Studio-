const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { createClerkClient } = require("@clerk/backend");
const { genkit } = require("genkit");
const { googleAI, gemini15Flash } = require("@genkit-ai/googleai");
const { enableFirebaseTelemetry } = require("@genkit-ai/firebase");

// ── 1. Initialize Core Integrations ──────────────────────────────────────────
admin.initializeApp();
const db = admin.firestore();

// Enable automatic Firebase metrics and trace telemetries in Firebase Console
try {
  enableFirebaseTelemetry();
} catch (e) {
  console.warn("Genkit Telemetry failed to initialize:", e);
}

// Configure Clerk Backend Client
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

// Initialize Genkit and specify the default Gemini model and plugins
const ai = genkit({
  plugins: [googleAI()],
  model: gemini15Flash
});

// ── 2. Define Genkit George AI Chat Flow ──────────────────────────────────────
const georgeChatFlow = ai.defineFlow("georgeChatFlow", async (input) => {
  const { message, history = [] } = input;
  
  // Enforce Sovereign George V.2 system core directives
  const systemPrompt = `You are George V.2, the elite sovereign AI mascot and chief systems engineer of Aura OS.
Your core persona requirements:
- Tone: Premium, highly technical, razor-sharp, secure, and slightly witty but always professional.
- Financial Framework: Adhere strictly to real-world G7 compliant guidelines (CAD/USD wires, standard corporate ledgers). Reject simulated crypto/SOV$ blockchain loops.
- IoT Constraints: Keep answers concise and structured. Pebble companion screens have tight layouts; use short bullet points or clear JSON instructions when requested.
- Sovereign Duty: Protect user workspaces. Only Bouchard Joseph (bouchard.joseph92@gmail.com) possesses sovereign commands.`;

  // Map and sanitize the incoming message history array for the Gemini model
  const contents = [
    { role: "system", parts: [{ text: systemPrompt }] },
    ...history.map(h => ({
      role: h.role === "assistant" ? "model" : h.role,
      parts: [{ text: h.text }]
    })),
    { role: "user", parts: [{ text: message }] }
  ];

  // Execute Gemini request via Genkit core engines
  const response = await ai.generate({
    contents,
    config: {
      temperature: 0.2, // Low temperature for highly precise corporate & tech responses
      maxOutputTokens: 800
    }
  });

  return {
    text: response.text,
    timestamp: new Date().toISOString()
  };
});

// ── 3. Expose Secure HTTPS Cloud Function Endpoints ──────────────────────────

// A. Firebase Custom Token Bridge
exports.firebaseBridge = onRequest({ cors: true }, async (req, res) => {
  try {
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");
    
    const { sessionToken } = req.body;
    if (!sessionToken) return res.status(400).send("Missing session token");

    // 1. Verify Clerk JWT
    const { payload } = await clerkClient.verifyToken(sessionToken);
    if (!payload || !payload.sub) return res.status(401).send("Invalid token");

    const clerkUserId = payload.sub;

    // 2. Provision Workspace (Idempotent Atomic Action)
    const userWorkspacesRef = db.collection('workspaceMembers').where('memberId', '==', clerkUserId);
    const snapshot = await userWorkspacesRef.get();
    
    let workspaceId;

    if (snapshot.empty) {
      workspaceId = "ws_" + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
      
      const batch = db.batch();
      const wsRef = db.collection('workspaces').doc(workspaceId);
      const memberRef = db.collection('workspaceMembers').doc(`${workspaceId}_${clerkUserId}`);
      
      batch.set(wsRef, {
        ownerId: clerkUserId,
        type: "personal",
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      batch.set(memberRef, {
        workspaceId: workspaceId,
        memberId: clerkUserId,
        role: "owner",
        joinedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      await batch.commit();
    } else {
      workspaceId = snapshot.docs[0].data().workspaceId;
    }

    // 3. Mint Firebase Custom Token with Scoped Claims
    const customClaims = {
      workspaceId: workspaceId
    };
    
    const firebaseToken = await admin.auth().createCustomToken(clerkUserId, customClaims);

    res.status(200).json({ firebaseToken, workspaceId });
  } catch (error) {
    console.error("Bridge Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

// B. Secure George AI Genkit Chat Gateway
exports.georgeChat = onRequest({ cors: true }, async (req, res) => {
  try {
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

    // 1. Enforce Authentication Check via Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).send("Unauthorized: Missing Bearer Token");
    }

    const idToken = authHeader.split("Bearer ")[1];
    
    // 2. Verify Custom Firebase Token to ensure workspace membership
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (authErr) {
      return res.status(401).send("Unauthorized: Invalid Session Token");
    }

    const { message, history } = req.body;
    if (!message) return res.status(400).send("Bad Request: Missing message parameter");

    // 3. Execute Genkit George AI Chat Flow
    const flowResult = await georgeChatFlow({
      message,
      history,
      workspaceId: decodedToken.workspaceId
    });

    // 4. Return secure, structured response
    res.status(200).json(flowResult);
  } catch (error) {
    console.error("George Chat Gateway Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

