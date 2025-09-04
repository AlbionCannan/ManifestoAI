import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

const box = {minHeight:"100vh",display:"grid",placeItems:"center",fontFamily:"system-ui",background:"#0f1115",color:"#e6e7eb"};
function Home(){ return <div style={box}><h1>Home</h1><Link to="/a">Go A</Link></div>; }
function A(){ return <div style={box}><h1>Route A</h1><Link to="/">Back</Link></div>; }

export default function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/a" element={<A/>}/>
        <Route path="*" element={<div style={box}><h1>404</h1></div>} />
      </Routes>
    </BrowserRouter>
  );
}
