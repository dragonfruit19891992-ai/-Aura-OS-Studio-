// core/workspaceResolver.js
window.AuraWorkspace = (function() {
    return {
        getActiveWorkspace: function() {
            // For Phase 1A, we only have one workspace per session,
            // managed by the Bridge. Later, this will read from the URL or User State
            // to support switching between Personal, Family, and Business orgs.
            if (!window.AuraBridge) return null;
            return window.AuraBridge.getWorkspaceId();
        }
    };
})();
