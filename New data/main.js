import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

console.log("Displaying simple bar chart");

// Declare the chart dimensions and margins.
const width = 1250;
const height = 600;
const marginTop = 20;
const marginRight = 20;
const marginBottom = 30;
const marginLeft = 40;

async function fetchData() {
  const url = "./BySector.json"; // data from https://opendata.swiss/en/dataset/treibhausgasBuildingsen-im-kanton-zurich
  let response = await fetch(url);

  if (response.ok) {
    // if HTTP-status is 200-299
    // get the response body (the method explained below)
    let json = await response.json();
    console.log("Finally received the response:");
    console.log("Response: ", json);
    const filteredData = filterData(json);
    drawChart(filteredData);
  } else {
    alert("HTTP-Error: " + response.status);
  }
}

function filterData(data) {
  return data.filter(
    (item) =>  item.Year >=
     1990
  );
}

function drawChart(data) {
  console.log("data: ", data);

  // Create the SVG container.
  const svg = d3.create("svg").attr("width", width).attr("height", height);

  const maxBuildings = d3.max(data, (d) => d.Buildings);

  // Declare the x (horizontal position) scale.
  const x = d3
    .scaleBand()
    .domain(d3.range(1990, 2026))
    .range([marginLeft, width - marginRight])
    .padding(0.2);

  // Declare the y (vertical position) scale.
  const y = d3
    .scaleLinear()
    .domain([0, maxBuildings])
    .range([height - marginBottom, marginTop]);

  // Add the x-axis.
  svg
    .append("g")
    .attr("transform", `translate(0,${height - marginBottom+5})`)
    .call(d3.axisBottom(x));

  // Add the y-axis.
  svg
    .append("g")
    .attr("transform", `translate(${marginLeft}, 0)`)
    .call(d3.axisLeft(y));

  // Declare the bars
  svg
    .append("g")
    .selectAll()
    .data(data)
    .join("rect")
    .attr("fill", "blue")
    .attr("x", (d) => x(d.Year))
    .attr("y", (d) => y(d.Buildings))
    .attr("height", (d) => height - y(d.Buildings) - marginBottom)
    .attr("data-Year", (d) => d.Year)
    .attr("width", x.bandwidth())
    .attr("rx", 5)
    .attr("rx", 5)
    .attr("fill", (d, i) => d3.schemeAccent[i % 5]);

  // Add y-axis label
  svg
    .append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("font-size", "10px")
    .attr("font-family", "sans-serif")
    .attr("x", 140)

    .attr("y", 0)
    .attr("dy", ".75em")
    .text("Buildings CO2 (tons per Year)");

  // Append the SVG element.
  const container = document.getElementById("container");
  container.append(svg.node());
}

fetchData();