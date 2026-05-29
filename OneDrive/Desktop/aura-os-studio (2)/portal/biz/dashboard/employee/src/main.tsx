import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

const dummyEmployee = {
  id: "emp_001",
  name: "Marcus Cole",
  email: "marcus@aurasovereign.com",
  role: "technician",
  businessId: "biz_123",
  businessName: "Aura Sovereign"
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App 
      member={dummyEmployee} 
      businessName="Aura Sovereign" 
      onLogout={() => alert("Logout clicked")} 
    />
  </React.StrictMode>,
)
