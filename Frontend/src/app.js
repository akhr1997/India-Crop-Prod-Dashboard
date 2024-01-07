import {
  showLoadingSpinner,
  hideLoadingSpinner,
} from "./Helpers/loadingSpinner.js";
import {
  disableNextButton,
  disablePreviousButton,
} from "./Helpers/enableAndDisableNavButtons.js";

//Grabbing HTML Elements
const dataTable = document.getElementById("data-table");
const nextBtn = document.getElementById("nextButton");
const previousBtn = document.getElementById("prevButton");
const stateSelect = document.getElementById("state-select");
const dataHeaders = document.querySelectorAll(".table-head");
const table = document.getElementById("csv-table");

// let baseURL = "http://localhost:3000/api/data";
let baseURL = "http://localhost:3030/";

//Initialize global variables
let datas = [];
let stateArray = [];
let itemsPerPage = 15;
let currentPage = 1;
let page = 1;
let sortedData = [];
let productionPerYearChart;
let productionPerCropChart;

//Event Listeners
nextBtn.addEventListener("click", goToNextPage, false);
previousBtn.addEventListener("click", goToPreviousPage, false);
stateSelect.addEventListener("change", changeStates);
dataHeaders.forEach((head) => {
  head.addEventListener("click", sortTableOnTableHeadClick);
});

document.getElementById("current-page-number").innerText = currentPage;

//Helper Functions
async function changeStates() {
  await getData();
  if (stateSelect.value === "Select a State") {
    generateTableData(datas);
    disablePreviousButton(page);
    disableNextButton(page);
    return;
  }
  // await getData();
  datas = datas.filter((item) => item.State === stateSelect.value);
  generateTableData(datas);
  disablePreviousButton(page);
  disableNextButton(page);
}

async function renderTable() {
  //invoke the fetch function here so it fetches only when we render the table
  await getData();
  console.log("running getData() in render table");

  createProductionPerCropChart(datas);
  createProductionPerYearChart(datas);

  generateTableData(datas);
  disablePreviousButton(page);
  disableNextButton(page);
}

function generateTableData(datas) {
  let data = "";
  datas
    .filter((eachRow, index) => {
      //calculate which is the first page and last page
      let firstPage = (currentPage - 1) * itemsPerPage;
      let lastPage = currentPage * itemsPerPage;

      if (index >= firstPage && index < lastPage) return true;
    })
    .forEach((eachData) => {
      //create the td HTML element to append to the table body
      data += "<tr>";
      data += `<td>${eachData.State}</td>`; //Delete this later. Not in requirements
      data += `<td>${eachData.Year}</td>`;
      data += `<td>${eachData.Crop}</td>`;
      data += `<td>${eachData.District}</td>`;
      data += `<td>${eachData.Area}</td>`;
      data += `<td>${eachData.Production}</td>`;
      data += `<td>${eachData.Yield}</td>`;
      ("<tr>");
    });
  dataTable.innerHTML = data;
}

function sortTableOnTableHeadClick(event) {
  let filterKey = event.target.innerText;

  if (table.classList.contains("sorted-by-descending")) {
    sortedData = datas.sort((a, b) => a[filterKey].localeCompare(b[filterKey]));
    generateTableData(sortedData);
    table.classList.remove("sorted-by-descending");
    return;
  }
  console.log("clicked: ", event.target.innerText);
  sortedData = datas.sort((a, b) => b[filterKey].localeCompare(a[filterKey]));

  generateTableData(sortedData);

  table.classList.add("sorted-by-descending");
}

renderTable(currentPage);

async function getData() {
  try {
    showLoadingSpinner();
    const response = await fetch(baseURL);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const dataJSON = await response.json();
    datas = dataJSON;

    hideLoadingSpinner();
    createOptionElements(datas);

    return datas;
  } catch (error) {
    console.error("Error fetching data:", error);

    hideLoadingSpinner(); // Ensure loading spinner is hidden in case of an error
    throw error;
  }
}

function createOptionElements(datas) {
  datas.forEach((data) => {
    if (!stateArray.includes(data.State)) {
      stateArray.push(data.State);
      let newOption = document.createElement("option");
      newOption.text = data.State;
      newOption.value = data.State;
      stateSelect.append(newOption);
    }
  });
}

function goToNextPage() {
  if (currentPage * itemsPerPage < datas.length) {
    currentPage++;
    page++;
    document.getElementById("current-page-number").innerText = currentPage;
    changeStates();
  }
}

function goToPreviousPage() {
  if (currentPage > 1) {
    currentPage--;
    page--;
    document.getElementById("current-page-number").innerText = currentPage;
    changeStates();
  }
}

//Chart 1
function createProductionPerYearChart(datas) {
  // Extract unique crops and their total production
  const yearData = datas.reduce(function (acc, item) {
    const existingYearIndex = acc.findIndex((c) => c.Year === item.Year);
    //returns -1 if index is not found/ no element is found.

    let productionToAdd;
    productionToAdd = parseInt(item.Production);

    if (!isNaN(productionToAdd) && item.Year.toLowerCase() !== "coconut") {
      if (existingYearIndex !== -1) {
        acc[existingYearIndex].Production += productionToAdd;
      } else {
        acc.push({ Year: item.Year, Production: productionToAdd });
      }
    }

    return acc;
  }, []);

  // Extract labels and data for the chart
  const yearlabels = yearData.map((item) => item.Year);
  const productionData = yearData.map((item) => item.Production);

  // Create a bar chart
  const yearChartCtx = document.getElementById("yearChart").getContext("2d");

  productionPerYearChart = new Chart(yearChartCtx, {
    type: "bar",
    data: {
      labels: yearlabels,
      datasets: [
        {
          label: "Production per Year",
          data: productionData,
          borderWidth: 1,
        },
      ],
    },
  });

  productionPerYearChart.canvas.onclick = (event) =>
    clickHandler(event, productionPerYearChart);
}
let cropData;

//Chart 2
function createProductionPerCropChart(datas) {
  let filterCondition = "Crop";
  reduceFunction(datas, filterCondition);

  // Extract labels and data for the chart
  const labels = cropData.map((item) => item.Crop);
  const productionData = cropData.map((item) => item.Production);

  // Create a bar chart
  const cropChartCtx = document
    .getElementById("productionChart")
    .getContext("2d");

  productionPerCropChart = new Chart(cropChartCtx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Production per Crop",
          data: productionData,
          borderWidth: 1,
        },
      ],
    },
  });

  productionPerCropChart.canvas.onclick = (event) =>
    clickHandler(event, productionPerCropChart);
}

//Function to extract unique crops and their total production
function reduceFunction(datas, filterCondition) {
  cropData = datas.reduce(function (acc, item) {
    const existingCropIndex = acc.findIndex(
      (c) => c[filterCondition] === item[filterCondition]
    );
    //returns -1 if index is not found/ no element is found.

    let productionToAdd;
    productionToAdd = parseInt(item.Production);

    if (
      !isNaN(productionToAdd) &&
      item[filterCondition].toLowerCase() !== "coconut"
    ) {
      if (existingCropIndex !== -1) {
        acc[existingCropIndex].Production += productionToAdd;
      } else {
        acc.push({ Crop: item[filterCondition], Production: productionToAdd });
      }
    }

    return acc;
  }, []);
}

//To handle clicks on bar charts
async function clickHandler(click, chartInstance) {
  console.log(click);

  let points = chartInstance.getElementsAtEventForMode(
    click,
    "nearest",
    {
      intersect: true,
    },
    true
  );

  if (points[0]) {
    const dataset = points[0].datasetIndex;
    const index = points[0].index;
    const selectedLabel = chartInstance.data.labels[index];
    console.log(selectedLabel);

    await getData();

    if (chartInstance === productionPerYearChart) {
      let newYearDatas = datas.filter((item) => item.Year === selectedLabel);
      generateTableData(newYearDatas);
    } else {
      let newCropDatas = datas.filter((item) => item.Crop === selectedLabel);
      generateTableData(newCropDatas);
    }

    disablePreviousButton(page);
    disableNextButton(page);
  }
}

export { getData };
