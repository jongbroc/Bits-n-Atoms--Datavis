import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

console.log("Displaying simple bar chart");

// Declare the chart dimensions and margins.
const width = 1250; // Width of the chart SVG
const height = 600; // Height of the chart SVG
const margin = { top: 20, right: 20, bottom: 30, left: 40 }; // Chart margins for axes and padding

// Function to fetch data from the specified JSON file
async function fetchData() {
  const url = "./BySector.json"; // Path to the JSON data file
  let response = await fetch(url); // Fetch the data asynchronously

  if (response.ok) {
    // If the fetch succeeds
    let json = await response.json(); // Parse the JSON data
    console.log("Response: ", json);
    const filteredData = filterData(json); // Filter the data for years >= 1990
    drawChart(filteredData); // Draw the chart with the filtered data
  } else {
    // Handle fetch errors
    alert("HTTP-Error: " + response.status);
  }
}

// Function to filter data for years >= 1990
function filterData(data) {
  return data.filter((item) => item.Year >= 1990); // Keeps only data with Year >= 1990
  // NOTE: This does not limit to 1998; issue must lie elsewhere if data is missing.
}

// Main function to draw the chart
function drawChart(data) {
  // Define the emission sectors
  const sectors = [
    "Buildings",
    "Industry",
    "Forestry",
    "Combustion",
    "Transport",
    "Manufacturing_Construction",
    "EnergyProduction",
    "Electricity_Heat",
    "BunkerFuels",
  ];

  const years = data.map((d) => d.Year); // Extract years from data
  const values = data.map((d) =>
    sectors.map((sector) => d[sector]) // Create an array of sector values for each year
  );



  

  const n = sectors.length; // Number of groups (sectors)
  const m = years.length; // Number of years (should correspond to all filtered years)

  const yz = d3.range(n).map((d) => (years));
  const xz = d3.range(m);
  console.log("yz: ", yz);

  // Create stacked data structure
  const y01z = d3
    .stack()
    .keys(d3.range(n)) // Create stacks for each sector
    (d3.transpose(yz)) // Transpose rows into columns for stacking
    .map((data, i) => data.map(([y0, y1]) => [y0, y1, i]));

  console.log("y01z", y01z);

  const yMax = d3.max(yz, (y) => d3.max(y)); // Max value across all sectors for grouped bars
  const y1Max = d3.max(y01z, (y) => d3.max(y, (d) => d[1])); // Max value for stacked bars

  // X-axis scale for years
  const x = d3
    .scaleBand()
    .domain(xz) // Map index to years
    .rangeRound([margin.left, width - margin.right]) // Adjust to chart width
    .padding(0.08);

  // Y-axis scale for emissions values
  const y = d3
    .scaleLinear()
    .domain([0, y1Max]) // Scale based on max stacked value
    .range([height - margin.bottom, margin.top]);

  // Color scale for each sector
  const color = d3
    .scaleSequential(d3.interpolateOranges)
    .domain([-0.5 * n, 1 * n]);

  // Create SVG container
  const svg = d3
    .select("body")
    .append("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", width)
    .attr("height", height);

  // Append groups for each sector and their rectangles
  const rect = svg
    .selectAll("g")
    .data(y01z) // Stacked data for each sector
    .join("g")
    // .attr("fill", (d, i) => color(i)) // Assign color to each sector
    // .attr("fill", (d, i) => d3.schemeAccent[i % 9])
    .selectAll("rect")
    .data((d) => d) // Add rectangles for each year's values
    // .data(data)
    .join("rect")
    .attr("x", (d, i) => {
      return x(i)
    }) // Position based on year index
    .attr("y", height - margin.bottom) // Start from bottom of the chart
    .attr("width", x.bandwidth()) // Width of each bar
    .attr("height", 0) // Initial height of 0 for transition
    .attr("rx", 5)
    .attr("rx", 5)
    

  // Transition to final bar heights
  rect
    .transition()
    .delay((d, i) => i * 20) // Add delay for each bar
    .duration(500) // Transition duration
    .attr("y", (d) => y(d[1])) // Final Y position (top of the bar)
    .attr("height", (d) => y(d[0]) - y(d[1])); // Final height

  // Append X-axis
  svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(
      d3.axisBottom(x)
        .tickFormat((i) => years[i]) // Label with corresponding year
        .tickSizeOuter(0)
    );

  // Append Y-axis
  svg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(null, "s")); // Add tick marks and format

  // Functions to transition between grouped and stacked views
  function transitionGrouped() {
    y.domain([0, yMax]); // Adjust Y scale for grouped bars

    rect
      .transition()
      .duration(500)
      .delay((d, i) => i * 20)
      .attr("x", (d, i) => x(i) + (x.bandwidth() / n) * d[2]) // Adjust X for group positioning
      .attr("width", x.bandwidth() / n) // Adjust width for grouping
      .transition()
      .attr("y", (d) => y(d[1] - d[0])) // Adjust Y for grouped height
      .attr("height", (d) => y(0) - y(d[1] - d[0]));
      
  }

  function transitionStacked() {
    y.domain([0, y1Max]); // Adjust Y scale for stacked bars

    rect
      .transition()
      .duration(500)
      .delay((d, i) => i * 20)
      .attr("y", (d) => y(d[1])) // Final Y for stacked bars
      .attr("height", (d) => y(d[0]) - y(d[1])) // Final height for stacking
      .transition()
      .attr("x", (d, i) => x(i)) // Reset X for stacking
      .attr("width", x.bandwidth()); // Reset width for stacking
  }

  // Add buttons for user interaction
  d3.select("body")
    .append("button")
    .text("Stacked")
    .on("click", () => transitionStacked());

  d3.select("body")
    .append("button")
    .text("Grouped")
    .on("click", () => transitionGrouped());

  // console.log("Years:", years); // Check all years
  // console.log("Number of years (m):", m); // Ensure this is correct
  console.log("X scale domain:", d3.range(m));
  // console.log("y01z data:", y01z); // Check the structure of the stacked data
  // console.log("Number of bars:", rect.size()); // Ensure it matches the expected count (31 * number of sectors)
  // console.log("Rect data:", svg.selectAll("rect").data()); // Ensure data is correctly bound
  // console.log("X positions:", y01z.map((d) => d.map((bar, i) => x(i)))); // Ensure all bars have valid X positions

  // console.log("Values array:", values); // Check if this contains data for all years and sectors
  // console.log("y01z structure:", y01z); // Check if y01z has correct structure for all years and sectors
  // console.log("Bound data for rects:", svg.selectAll("rect").data()); // Ensure the count matches years * sectors

  console.log("Number of rects created:", rect.size());
  console.log("X positions for bars:", y01z.map((d) => d.map((bar, i) => x(i))));
  console.log("x pos: ", (d, i) => x(i));
}

// Fetch and process data
fetchData();
