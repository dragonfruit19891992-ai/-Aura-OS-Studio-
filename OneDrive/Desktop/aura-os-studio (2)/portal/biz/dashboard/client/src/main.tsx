import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

const dummyMember = {
  id: "client_999",
  name: "Sarah Jenkins",
  email: "sarah@example.com",
  role: "client",
  businessId: "biz_123",
  businessName: "Aura Sovereign",
  slug: "aura-sovereign"
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App 
      member={dummyMember} 
      businessName="Aura Sovereign" 
      slug="aura-sovereign" 
      onLogout={() => alert("Logout clicked")} 
    />
  </React.StrictMode>,
)
