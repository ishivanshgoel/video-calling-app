import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

// homepage
import Home from './pages/Home'
import Meeting from './pages/Meeting'

function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route exact path="/meeting/:id">
            <Meeting />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
