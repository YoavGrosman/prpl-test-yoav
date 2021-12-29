import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Algoritm from './pages/Algoritm';
import Profile from './pages/Profile';
import './app.css';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Algoritm />} />
          <Route path="/algoritm-test" element={<Algoritm />} />
          <Route path='/profile-test' element={<Profile />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
