import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import HealthReport from './HealthReport.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <div className="d-flex justify-content-center align-items-center vh-100 w-100">
      <HealthReport />
    </div>
  </StrictMode>
);