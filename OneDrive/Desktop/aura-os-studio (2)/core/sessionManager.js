// core/sessionManager.js
window.AuraSession = (function() {
    let clerkInstance = null;
    let isReady = false;
    let listeners = [];

    // Inject Clerk SDK script dynamically
    function loadClerk() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.setAttribute('data-clerk-publishable-key', window.AuraConfig.CLERK_PUBLISHABLE_KEY);
            script.async = true;
            script.src = "https://cdn.jsdelivr.net/npm/@clerk/clerk-js@latest/dist/clerk.browser.js";
            script.crossOrigin = "anonymous";
            
            script.onload = () => {
                const Clerk = window.Clerk;
                Clerk.load().then(() => {
                    clerkInstance = Clerk;
                    isReady = true;
                    listeners.forEach(cb => cb(Clerk));
                    resolve(Clerk);
                }).catch(reject);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    return {
        init: async function() {
            if (isReady) return clerkInstance;
            return await loadClerk();
        },
        getClerk: function() {
            return clerkInstance;
        },
        onReady: function(cb) {
            if (isReady) cb(clerkInstance);
            else listeners.push(cb);
        },
        isAuthenticated: function() {
            return clerkInstance && clerkInstance.user !== null;
        },
        getToken: async function() {
            if (!clerkInstance || !clerkInstance.session) return null;
            return await clerkInstance.session.getToken();
        }
    };
})();
