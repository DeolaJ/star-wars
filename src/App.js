import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import './styles/main.scss';
import Home from './components/home';
import Planets from './components/planets';
import Characters from './components/characters';
import Starships from './components/starships';
import Description from './components/description';

const App = () => {
  return (
    <Router basename="/">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/planets" component={Planets} />
        <Route path="/characters" component={Characters} />
        <Route path="/starships" component={Starships} />
        <Route path="/description/:category/:id" component={Description} />
      </Switch>
    </Router>
  );
}

export default App;
