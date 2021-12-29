import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Algoritm from './pages/Algoritm';
import Profile from './pages/Profile';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

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
      <ToastContainer />
    </>
  );
}

export default App;
