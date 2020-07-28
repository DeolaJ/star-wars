import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';
import './styles/main.scss';
import Home from './components/home';
import Planets from './components/planets';
import Characters from './components/characters';
import Starships from './components/starships';
import Description from './components/description';

class App extends PureComponent {
  componentDidMount () {
    // Load Star wars information from the API
    const {
      doFetchCharacters, doFetchPlanets, doFetchStarships
    } = this.props;
    doFetchCharacters();
    doFetchPlanets();
    doFetchStarships();
  }
  render () {
    const {
      characters, planets, starships, loading, loadingCharactersError, 
      loadingPlanetsError, loadingStarshipsError,
    } = this.props;
    console.log(this.props)
    return (
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/planets" component={Planets} />
        <Route path="/characters" component={Characters} />
        <Route path="/starships" component={Starships} />
        <Route path="/description/:category/:id" component={Description} />
      </Switch>
    );
  };
};

App.propTypes = {
  doFetchCharacters: PropTypes.func.isRequired,
  doFetchPlanets: PropTypes.func.isRequired,
  doFetchStarships: PropTypes.func.isRequired,
  characters: PropTypes.arrayOf(PropTypes.object).isRequired,
  planets: PropTypes.arrayOf(PropTypes.object).isRequired,
  starships: PropTypes.arrayOf(PropTypes.object).isRequired,
  loadingCharactersError: PropTypes.string.isRequired,
  loadingPlanetsError: PropTypes.string.isRequired,
  loadingStarshipsError: PropTypes.string.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default App;
