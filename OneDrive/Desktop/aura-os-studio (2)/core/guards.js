// core/guards.js
window.AuraGuards = (function() {
    return {
        requireAuth: async function() {
            // Apply initial black screen covering the UI
            document.body.style.display = 'none';

            // Wait for Clerk to initialize
            const Clerk = await window.AuraSession.init();

            if (!Clerk.user) {
                // User is not logged in. Kick them out.
                window.location.href = '/login/';
                return false;
            }

            // Extract the user's primary email address from Clerk
            const email = Clerk.user.primaryEmailAddress ? Clerk.user.primaryEmailAddress.emailAddress : "";
            
            // Check if user is accessing the George AI dashboard / geogeadmin / george
            const isGeorgeDashboard = 
                window.location.hostname === "george.aurame.ca" || 
                window.location.hostname === "geogeadmin.aurame.ca" ||
                window.location.pathname.includes("/mycodes/dashboard");

            if (isGeorgeDashboard && email.toLowerCase() !== "bouchard.joseph92@gmail.com") {
                console.error("Sovereign Identity Blocked: Only bouchard.joseph92@gmail.com can log in.");
                
                // Render the premium Sovereign Access Denied Cyber-Shield
                document.body.style.display = 'block';
                document.body.innerHTML = `
                    <div style="
                        position: fixed; inset: 0; 
                        background: radial-gradient(circle at 50% 50%, #1a0808 0%, #08080f 80%); 
                        color: #f1f5f9; font-family: 'Inter', system-ui, sans-serif;
                        display: flex; align-items: center; justify-content: center;
                        z-index: 999999; overflow: hidden;
                    ">
                        <!-- Scanline and ambient terminal effects -->
                        <div style="
                            position: absolute; inset: 0;
                            background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
                            background-size: 100% 4px, 6px 100%;
                            opacity: 0.8; pointer-events: none;
                        "></div>

                        <!-- Sovereign Shield Container -->
                        <div style="
                            width: 90%; max-width: 500px;
                            background: rgba(18, 10, 10, 0.65);
                            backdrop-filter: blur(24px);
                            -webkit-backdrop-filter: blur(24px);
                            border: 1px solid rgba(239, 68, 68, 0.25);
                            box-shadow: 0 20px 60px rgba(239, 68, 68, 0.15), inset 0 0 40px rgba(239, 68, 68, 0.08);
                            border-radius: 28px; padding: 48px 40px;
                            text-align: center; position: relative;
                            animation: float 6s ease-in-out infinite;
                        ">
                            <!-- Glowing Warning Badge -->
                            <div style="
                                display: inline-flex; align-items: center; gap: 8px;
                                padding: 6px 16px; border-radius: 999px;
                                border: 1px solid rgba(239, 68, 68, 0.35);
                                background: rgba(239, 68, 68, 0.12);
                                font-size: 11px; font-family: monospace;
                                text-transform: uppercase; letter-spacing: 0.2em;
                                color: #fca5a5; margin-bottom: 28px;
                            ">
                                <span style="
                                    width: 6px; height: 6px; border-radius: 50%;
                                    background: #ef4444; box-shadow: 0 0 10px #ef4444;
                                    animation: pulse 1.5s infinite;
                                "></span>
                                Sovereign Firewall
                            </div>

                            <!-- Pulsing Shield Icon -->
                            <div style="
                                font-size: 64px; color: #ef4444; margin-bottom: 24px;
                                filter: drop-shadow(0 0 15px rgba(239, 68, 68, 0.4));
                                animation: pulse 2s infinite;
                            ">
                                🛡️
                            </div>

                            <!-- Alert Headline & Messages -->
                            <h1 style="
                                font-size: 22px; font-weight: 950; font-family: monospace;
                                letter-spacing: 0.05em; color: #fca5a5; margin-bottom: 12px;
                                text-transform: uppercase;
                            ">
                                Access Denied
                            </h1>
                            <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin-bottom: 28px;">
                                Attempted login as <code style="color: #fca5a5; background: rgba(239, 68, 68, 0.18); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-weight: 600;">${email}</code> is unauthorized.<br>
                                Only <strong style="color: #fff; font-weight: 700;">bouchard.joseph92@gmail.com</strong> possesses sovereign authorization to command George V.2.
                            </p>

                            <!-- Node & Session Details -->
                            <div style="
                                background: rgba(0, 0, 0, 0.35);
                                border: 1px solid rgba(255, 255, 255, 0.05);
                                border-radius: 14px; padding: 14px 18px;
                                font-family: monospace; font-size: 11px;
                                text-align: left; color: #64748b; margin-bottom: 32px;
                            ">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                    <span>TIMESTAMP:</span>
                                    <span style="color: #cbd5e1;">${new Date().toISOString()}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                    <span>PORTAL:</span>
                                    <span style="color: #cbd5e1;">GEORGE_AI_V2</span>
                                </div>
                                <div style="display: flex; justify-content: space-between;">
                                    <span>FIREWALL STATUS:</span>
                                    <span style="color: #ef4444; font-weight: bold; letter-spacing: 0.05em;">SECURE_LOCKOUT</span>
                                </div>
                            </div>

                            <!-- Sovereign Sign Out Action -->
                            <button id="sov-signout-btn" style="
                                width: 100%; padding: 14px 24px; border-radius: 12px;
                                background: linear-gradient(90deg, #ef4444, #b91c1c);
                                border: none; color: #fff; font-family: monospace;
                                font-weight: 700; font-size: 12px; text-transform: uppercase;
                                letter-spacing: 0.12em; cursor: pointer;
                                box-shadow: 0 4px 15px rgba(239, 68, 68, 0.25);
                                transition: all 0.2s ease;
                            ">
                                Sovereign Sign Out
                            </button>
                        </div>
                    </div>

                    <style>
                        @keyframes pulse {
                            0%, 100% { opacity: 0.4; }
                            50% { opacity: 1; }
                        }
                        @keyframes float {
                            0% { transform: translateY(0px) rotate(0deg); }
                            50% { transform: translateY(-6px) rotate(0.2deg); }
                            100% { transform: translateY(0px) rotate(0deg); }
                        }
                        #sov-signout-btn:hover {
                            transform: translateY(-1.5px);
                            box-shadow: 0 6px 22px rgba(239, 68, 68, 0.45);
                            filter: brightness(1.1);
                        }
                        #sov-signout-btn:active {
                            transform: translateY(0px);
                        }
                    </style>
                `;

                // Bind Clerk session sign-out handler to button click
                document.getElementById('sov-signout-btn').onclick = async function() {
                    const btn = document.getElementById('sov-signout-btn');
                    btn.disabled = true;
                    btn.innerText = "Signing Out...";
                    try {
                        const Clerk = window.AuraSession.getClerk();
                        if (Clerk) {
                            await Clerk.signOut();
                        }
                    } catch (e) {
                        console.error("Sign out error", e);
                    }
                    window.location.href = '/login/';
                };

                return false;
            }

            // User is logged in via Clerk. Proceed with bridging to Firebase.
            const clerkToken = await window.AuraSession.getToken();
            const bridgeResult = await window.AuraBridge.exchangeToken(clerkToken);

            if (!bridgeResult || !bridgeResult.workspaceId) {
                // The backend rejected them or provisioning failed.
                console.error("Critical Auth Failure: Bridge rejected session.");
                window.location.href = '/login/?error=bridge_failure';
                return false;
            }

            // Authentication & Provisioning Successful. Reveal the UI.
            document.body.style.display = 'block';
            console.log("Aura OS Core: Access Granted to Workspace", bridgeResult.workspaceId);
            return true;
        }
    };
})();
