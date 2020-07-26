import React from 'react';
import { Link } from 'react-router-dom';
import Section from './partials/section';
import Slider from './partials/slider';
import ListItem from './partials/list-item';

const MainApp = () => {
  // componentDidMount () {
  //   this.setState({
  //     filtered: this.state.items
  //   })
  // }
  
  // componentDidUpdate(prevProps, prevState) {
  //   if (prevState.items !== this.state.items) {
  //     this.setState({
  //       filtered: this.state.items
  //     });
  //   }
  // }

  // changeResultPage = (event) => {
  //   this.setState({
  //     currentIndex: Number(event.target.id)
  //   });
  // }

  // handleChange = (e) => {
  //   // Variable to hold the original version of the list
  //   let currentList = [],
  //   // Variable to hold the filtered list before putting into state
  //       newList = [];

  //   // If the search bar isn't empty
  //   if (e.target.value !== "") {
  //     // Assign the original list to currentList
  //     currentList = this.state.items;

  //     // Use .filter() to determine which items should be displayed
  //     // based on the search terms
  //     newList = currentList.filter(item => {
  //       // change current item to lowercase
  //       const lc = item.toLowerCase();
  //       // change search term to lowercase
  //       const filter = e.target.value.toLowerCase();
  //       // check to see if the current list item includes the search term
  //       // If it does, it will be added to newList. Using lowercase eliminates
  //       // issues with capitalization in search terms and search content
  //       return lc.includes(filter);
  //     });
  //   } else {
  //     // If the search bar is empty, set newList to original task list
  //     newList = this.state.items;
  //   }
  //   // Set the filtered state based on what our rules added to newList
  //   this.setState({
  //     filtered: newList
  //   });
  // }
    // const { items, currentIndex, resultsPerPage, isFiltering, filtered } = this.state;

    // // Logic for displaying todos
    // const recentResultsEndIndex = currentIndex * resultsPerPage;
    // const firstResultIndex = recentResultsEndIndex - resultsPerPage;
    // const currentItems = filtered.slice(firstResultIndex, recentResultsEndIndex);

    // const renderFiltered = currentItems.map((filteredItems, index) => {
    //   return <li key={index}>{filteredItems}</li>;
    // });
  const view = "grid";
  const starships = [];
  const characters = [];
  const planets = [];
  return (
    <div className="home">
      {/* Starships Section */}
      <Section
        title="Popular Starships"
      >
        {
          starships.slice(0, 6).map(starship => {
            const imagePosition = "top";
            return (
              <React.Fragment key={starship.id}>
                <ListItem
                  imagePosition={imagePosition}
                  title={starship.title}
                  subtitle={starship.subtitle}
                  description={starship.description}
                  link={starship.link}
                  imageLink={starship.imageLink}
                  view={view}
                />
              </React.Fragment>
            )
          })
        }
        <div className="section__button">
          <Link to="/starships">
            <button
              type="button"
            >
              View All
            </button>
          </Link>
        </div>
      </Section>

      {/* Planets Section */}
      <Section
        title="Popular Planets"
      >
        <Slider
          items={planets.slice(0, 9)}
          resultsPerView={3}
          imagePosition="top"
        />
        <div className="section__button">
          <Link to="/characters">
            <button
              type="button"
            >
              View All
            </button>
          </Link>
        </div>
      </Section>

      {/* Characters Section */}
      <Section
        title="Popular Characters"
      >
        {
          characters.slice(0, 4).map(character => {
            const imagePosition = "left";
            return (
              <React.Fragment key={character.id}>
                <ListItem
                  imagePosition={imagePosition}
                  title={character.title}
                  subtitle={character.subtitle}
                  description={character.description}
                  link={character.link}
                  imageLink={character.imageLink}
                  view={view}
                />
              </React.Fragment>
            )
          })
        }
        <div className="section__button">
          <Link to="/characters">
            <button
              type="button"
            >
              View All
            </button>
          </Link>
        </div>
      </Section>
    </div>
  );
};

export default MainApp;
