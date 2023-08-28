import React from 'react';
import { Box } from '@mui/material'
import PrepSlider from './PrepSlider';
import CookSlider from './CookSlider';
import TotalSlider from './TotalSlider';
import FilterableIngredients from './FilterableIngredients';
import FilterableTags from './FilterableTags';

function Filter() {

  return (
    <div style={{ width: "30rem", display: "flex" }}>
      <Box sx={{ width: "15rem", margin: "auto" }}>
        <PrepSlider/>
        <CookSlider/>
        <TotalSlider/>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "space-evenly" }}>
        <Box sx={{ border: "1px solid grey", height: "45%", width: "12.5rem", borderRadius: "10px", overflow: "scroll" }}>
          <FilterableTags/>
        </Box>
        <Box sx={{ border: "1px solid grey", height: "45%", width: "12.5rem", borderRadius: "10px", overflow: "scroll" }}>
          <FilterableIngredients/>
        </Box>
      </Box>
    </div>
  );
}

export default Filter;