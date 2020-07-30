import React from 'react';
import PropTypes from 'prop-types';
import Section from './section';
import ListItem from './list-item';

const SearchResult = ({ 
  type, allFilteredCharacters, allFilteredPlanets, allFilteredStarships, 
  category, charactersSearch, planetsSearch, starshipsSearch, view,
}) => {
  const checkCategoryType = (category) => {
    if (category === "characters") {
      return {
        list: allFilteredCharacters,
        cache: charactersSearch, 
      }
    } else if (category === "planets") {
      return {
        list: allFilteredPlanets,
        cache: planetsSearch, 
      }
    } else if (category === "starships") {
      return {
        list: allFilteredStarships,
        cache: starshipsSearch, 
      }
    }
  };
  switch (type) {
    case 'all': {
      return (
        <div className="search-result__all">
          <h2 className="search-result__title">
            All Results
          </h2>
          <div className="search-result__body">
            <Section 
              title={"Planets"}
            >
              {
                allFilteredPlanets.map(planet => (
                  <React.Fragment key={planet.name}>
                    <ListItem
                      imagePosition="top"
                      name={planet.name}
                      type="planets"
                      population={planet.population}
                      temperature={planet.temperature}
                      view="grid"
                    />
                  </React.Fragment>
                ))
              }
            </Section>

            <Section 
              title={"Characters"}
            >
              {
                allFilteredCharacters.map(character => (
                  <React.Fragment key={character.name}>
                    <ListItem
                      imagePosition="left"
                      type="characters"
                      name={character.name}
                      birthyear={character.birth_year}
                      gender={character.gender}
                      view="grid"
                    />
                  </React.Fragment>
                ))
              }
            </Section>

            <Section 
              title={"Starships"}
            >
              {
                allFilteredStarships.map(starship => (
                  <React.Fragment key={starship.name}>
                    <ListItem
                      imagePosition="top"
                      type="starships"
                      name={starship.name}
                      model={starship.model}
                      cargo={starship.cargo}
                      view="grid"
                    />
                  </React.Fragment>
                ))
              }
            </Section>
          </div>
        </div>
      )
    }

    case 'specific': {
      const categoryType = checkCategoryType(category);
      return (
        <div className="search-result__specific">
          <h2 className="search-result__title">
            {category.toUpperCase()} Results
          </h2>
          <div className="search-result__body">
            <Section 
              title="Search results"
            >
              {
                categoryType.list.map(item => (
                  <React.Fragment key={item.name}>
                    <ListItem
                      imagePosition={!item.gender ? "top" : "left"}
                      name={item.name}
                      type={category}
                      population={item.population ? item.population : null}
                      temperature={item.temperature ? item.temperature : null}
                      birthyear={item.birth_year ? item.birth_year : null}
                      gender={item.gender ? item.gender : null}
                      model={item.model ? item.model : null}
                      cargo={item.cargo ? item.cargo : null}
                      view={view}
                    />
                  </React.Fragment>
                ))
              }
            </Section>
          </div>
        </div>
      )
    }

    default: return null;
  }
};

SearchResult.propTypes = {
  type: PropTypes.string.isRequired,
  category: PropTypes.string,
  charactersSearch: PropTypes.objectOf(PropTypes.array),
  planetsSearch: PropTypes.objectOf(PropTypes.array),
  starshipsSearch: PropTypes.objectOf(PropTypes.array),
  allFilteredCharacters: PropTypes.arrayOf(PropTypes.object),
  allFilteredPlanets: PropTypes.arrayOf(PropTypes.object),
  allFilteredStarships: PropTypes.arrayOf(PropTypes.object),
};

export default SearchResult;
