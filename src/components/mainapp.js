import React, { PureComponent } from 'react';

class MainApp extends PureComponent {
  constructor() {
    super();
    this.state = {
      items: ['ac','bf','ch','de','eb','fa','gf','hc','ie','jj','kl'],
      currentIndex: 1,
      starships: 6,
      planets: 3,
      characters: 4,
      resultsPerPage: 6,
      filtered: [],
      isFiltering: true
    };
  }

  componentDidMount () {
    this.setState({
      filtered: this.state.items
    })
  }
  
  componentDidUpdate(prevProps, prevState) {
    if (prevState.items !== this.state.items) {
      this.setState({
        filtered: this.state.items
      });
    }
  }

  changeResultPage = (event) => {
    this.setState({
      currentIndex: Number(event.target.id)
    });
  }

  handleChange = (e) => {
    // Variable to hold the original version of the list
    let currentList = [],
    // Variable to hold the filtered list before putting into state
        newList = [];

    // If the search bar isn't empty
    if (e.target.value !== "") {
      // Assign the original list to currentList
      currentList = this.state.items;

      // Use .filter() to determine which items should be displayed
      // based on the search terms
      newList = currentList.filter(item => {
        // change current item to lowercase
        const lc = item.toLowerCase();
        // change search term to lowercase
        const filter = e.target.value.toLowerCase();
        // check to see if the current list item includes the search term
        // If it does, it will be added to newList. Using lowercase eliminates
        // issues with capitalization in search terms and search content
        return lc.includes(filter);
      });
    } else {
      // If the search bar is empty, set newList to original task list
      newList = this.state.items;
    }
    // Set the filtered state based on what our rules added to newList
    this.setState({
      filtered: newList
    });
  }

  render() {
    const { items, currentIndex, resultsPerPage, isFiltering, filtered } = this.state;

    // Logic for displaying todos
    const recentResultsEndIndex = currentIndex * resultsPerPage;
    const firstResultIndex = recentResultsEndIndex - resultsPerPage;
    const currentItems = filtered.slice(firstResultIndex, recentResultsEndIndex);

    const renderFiltered = currentItems.map((filteredItems, index) => {
      return <li key={index}>{filteredItems}</li>;
    });

    

    return (
      <div>
        <input type="text" className="input" placeholder="Search..." onChange={this.handleChange}/>

        {
          isFiltering && items.length > 0
          
          ? (
            <>
              <ul>
                {renderFiltered}
              </ul>
            </>
          )

          : (
            <>
              <div>
                <h2>Popular Starships</h2>
              </div>
              <div>
                <h2>Popular Planets</h2>
              </div>
              <div>
                <h2>Popular Characters</h2>
              </div>
            </>
          )
        }
      </div>
    );
  }
}

export default MainApp;