// core/firebaseBridge.js
window.AuraBridge = (function() {
    let customFirebaseToken = null;
    let activeWorkspaceId = null;

    return {
        exchangeToken: async function(clerkSessionToken) {
            try {
                // Call the secure Firebase Cloud Function backend
                // (Using relative URL or absolute API URL depending on deployment)
                const url = "https://us-central1-studio-5530652813-f1738.cloudfunctions.net/firebaseBridge";
                
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionToken: clerkSessionToken })
                });

                if (!response.ok) {
                    throw new Error("Failed to exchange token with secure bridge.");
                }

                const data = await response.json();
                customFirebaseToken = data.firebaseToken;
                activeWorkspaceId = data.workspaceId;

                // Here we would typically `signInWithCustomToken` using the Firebase Client SDK.
                // For Phase 1A, we will just store it to prove the token flow works.
                console.log("Successfully minted Firebase Custom Token for Workspace:", activeWorkspaceId);
                
                return { firebaseToken: customFirebaseToken, workspaceId: activeWorkspaceId };
            } catch (err) {
                console.error("Bridge Exchange Error:", err);
                return null;
            }
        },
        getWorkspaceId: function() {
            return activeWorkspaceId;
        }
    };
})();
