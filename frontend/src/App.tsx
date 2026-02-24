import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Layout } from "./components/Layout"
import Dashboard from "./pages/Dashboard"
import Vehicles from "./pages/Vehicles"
import Trails from "./pages/Trails"
import Tires from "./pages/Tires"

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/trails" element={<Trails />} />
          <Route path="/tires" element={<Tires />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
