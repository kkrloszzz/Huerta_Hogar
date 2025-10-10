import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <UserProvider> {/* Agregamos UserProvider para envolver la app y y proporcionar el contexto de usuario*/}
      <Router>
        <RouterConfig />
      </Router>
    </UserProvider>
  );
}

export default App;
