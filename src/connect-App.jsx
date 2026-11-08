import React from 'react'
import { connect } from 'react-redux'
import { useLocation } from 'react-router-dom'
import appActions from './app/actions'
import { selectResources } from './app/selectors'
import App from './App';

const mapStateToProps = (state) => ({
  resources: selectResources(state.app),
  isFilteringAll: state.app.isFilteringAll,
  recentlyViewed: state.app.recentlyViewed,
  descriptionItem: state.app.descriptionItem,
  items: state.app.items,
})

const mapDispatchToProps = (dispatch) => ({
  doFetchPage(resource, page) {
    dispatch(appActions.doFetchPage(resource, page))
  },
  doSearch(resource, param) {
    dispatch(appActions.doSearch(resource, param))
  },
  resetSearch(resource) {
    dispatch(appActions.resetSearch(resource))
  },
  doSearchAll(param) {
    dispatch(appActions.doSearchAll(param))
  },
  resetSearchAll() {
    dispatch(appActions.resetSearchAll())
  },
  setRecentlyViewed(type, item) {
    dispatch(appActions.setRecentlyViewed(type, item))
  },
  doSetDescription(category, name) {
    dispatch(appActions.doSetDescription(category, name))
  },
  doFetchItem(url) {
    dispatch(appActions.doFetchItem(url))
  },
})

// Link the Reducer state and Action creators to the App Component
const ConnectedApp = connect (mapStateToProps, mapDispatchToProps)(App)

// React Router 6 removed withRouter; supply the location prop via the hook instead
export default function ConnectedAppWithLocation(props) {
  const location = useLocation()
  return <ConnectedApp {...props} location={location} />
}
