// src/App.jsx
import AppRoutes from './routes'; // Import the routes configuration

function App() {
  return (
    // Layout components will wrap AppRoutes later
    <div className="App">
      {/* Header/Nav might go here if not in a Layout */}
      <AppRoutes /> {/* Render the defined routes */}
      {/* Footer might go here if not in a Layout */}
    </div>
  );
}

export default App;
