import { useContext } from "react";
import { Navigate } from "react-router-dom";


function PrivateRoute({ children }) {
  console.log("hello from route");

  
 
  const user = localStorage.getItem("user");
  
  return user ? children : <Navigate to="/login" />;
}

export default PrivateRoute;
