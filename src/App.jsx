import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Routes, Route } from 'react-router-dom';
import './styles/main.scss';
import Home from './components/home';
import ResourcePage from './components/resource-page';
import Description from './components/description';
import Loader from './components/partials/loader';
import { RESOURCE_KEYS, listPath } from './resources';
import { resourcesShape } from './components/resource-props';
import { itemsShape } from './components/partials/related-items';

class App extends PureComponent {

  componentDidMount () {
    // Load the first page of each resource; later pages load when they are opened
    const { doFetchPage } = this.props;
    RESOURCE_KEYS.forEach(resource => doFetchPage(resource, 1));
  }

  render () {
    const {
      resources, isFilteringAll, recentlyViewed, descriptionItem, items,
      doFetchPage, doFetchAll, doSearch, resetSearch, doSearchAll, resetSearchAll,
      setRecentlyViewed, doSetDescription, doFetchItem,
    } = this.props;

    if (RESOURCE_KEYS.some(resource => resources[resource].loading)) {
      return <Loader />;
    }

    return (
      <Routes>
        <Route path="/"
          element={
            <Home
              resources={resources}
              isFilteringAll={isFilteringAll}
              doSearchAll={doSearchAll}
              resetSearchAll={resetSearchAll}
            />
          }
        />
        {
          RESOURCE_KEYS.map(resource => (
            <Route
              key={resource}
              path={listPath(resource)}
              element={
                // Keyed so moving between two resource pages starts the new
                // one fresh instead of carrying over the page and search
                <ResourcePage
                  key={resource}
                  resource={resource}
                  data={resources[resource]}
                  doFetchPage={doFetchPage}
                  doFetchAll={doFetchAll}
                  doSearch={doSearch}
                  resetSearch={resetSearch}
                  doSearchAll={doSearchAll}
                  resetSearchAll={resetSearchAll}
                />
              }
            />
          ))
        }
        <Route path="/description/:category/:id"
          element={
            <Description
              setRecentlyViewed={setRecentlyViewed}
              recentlyViewed={recentlyViewed}
              descriptionItem={descriptionItem}
              items={items}
              doSetDescription={doSetDescription}
              doFetchItem={doFetchItem}
            />
          }
        />
      </Routes>
    );
  };
};

App.propTypes = {
  resources: resourcesShape.isRequired,
  isFilteringAll: PropTypes.bool.isRequired,
  recentlyViewed: PropTypes.object.isRequired,
  descriptionItem: PropTypes.object.isRequired,
  items: itemsShape.isRequired,
  doFetchPage: PropTypes.func.isRequired,
  doFetchAll: PropTypes.func.isRequired,
  doSearch: PropTypes.func.isRequired,
  resetSearch: PropTypes.func.isRequired,
  doSearchAll: PropTypes.func.isRequired,
  resetSearchAll: PropTypes.func.isRequired,
  setRecentlyViewed: PropTypes.func.isRequired,
  doSetDescription: PropTypes.func.isRequired,
  doFetchItem: PropTypes.func.isRequired,
};

export default App;
