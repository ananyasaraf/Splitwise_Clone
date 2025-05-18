import { BrowserRouter as Router, Routes, Route ,Navigate } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Signup from "./components/Signup";
import UserDashboard from "./components/UserDashboard";
import ExpensePage from "./components/ExpensePage";
import GroupPage from "./components/GroupPage";
import PaymentPage from "./components/PaymentPage";
import ExpenseSplit from "./components/ExpenseSplit";
import { useEffect, useState } from "react";

function App() {
  const[isAuthenticated,setIsAuthenticated]=useState(!!localStorage.getItem("user"));
  useEffect(()=>{
    const token = localStorage.getItem("user");
    setIsAuthenticated(!!token);
  },[]);
  return (
    <Router>
      <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated}/>
      <Routes>
        <Route path="/" element={<Login setIsAuthenticated={setIsAuthenticated}/>} />
        <Route path="/signup" element={<Signup setIsAuthenticated={setIsAuthenticated}/>} />
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated}/>} />


        <Route path="/dashboard" 
        element={isAuthenticated ? <UserDashboard /> : <Navigate to="/login" />} />
        <Route path="/expenses" element={isAuthenticated?<ExpensePage />:<Navigate to="/login"/>} />
        <Route path="/expenseSplits" element={isAuthenticated?<ExpenseSplit />:<Navigate to="/login"/>} />
        <Route path="/groups" element={isAuthenticated?<GroupPage />:<Navigate to ="/login"/>} />
        <Route path="/payments" element={isAuthenticated?<PaymentPage />:<Navigate to="/login"/>} />

        
      </Routes>
    </Router>
  );
}

export default App;
