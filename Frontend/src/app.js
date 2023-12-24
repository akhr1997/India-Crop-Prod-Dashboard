import { getNumberOfPage } from "./Helpers/getPageNumber.js";

//Grabbing HTML Elements
const dataTable = document.getElementById("data-table");
const nextBtn = document.getElementById("nextButton");
const previousBtn = document.getElementById("prevButton");
const stateSelect = document.getElementById("state-select");
const dataHeaders = document.querySelectorAll(".table-head");
const table = document.getElementById("csv-table");

let baseURL = "http://localhost:3000/api/data";

//Initialize global variables
let datas = [];
let stateArray = [];
let itemsPerPage = 15;
let currentPage = 1;
let page = 1;
let sortedData = [];

//Event Listeners
nextBtn.addEventListener("click", goToNextPage, false);
previousBtn.addEventListener("click", goToPreviousPage, false);
stateSelect.addEventListener("change", changeStates);
dataHeaders.forEach((head) => {
  head.addEventListener("click", headClicked);
});

document.getElementById("current-page-number").innerText = currentPage;

//Helper Functions
async function changeStates() {
  if (stateSelect.value === "Select a State") {
    generateTableData(datas);
    disablePreviousButton(page);
    disableNextButton(page);
    return;
  }
  await getData();
  datas = datas.filter((item) => item.State === stateSelect.value);
  generateTableData(datas);
  disablePreviousButton(page);
  disableNextButton(page);
}

async function renderTable() {
  //invoke the fetch function here so it fetches only when we render the table
  await getData();
  console.log("running getData() in render table");

  createProductionChart(datas);
  createYearChart(datas);

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

function headClicked(event) {
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

function disableNextButton(page) {
  if (page == getNumberOfPage(datas, itemsPerPage)) {
    nextBtn.disabled = true;
  } else {
    nextBtn.disabled = false;
  }
}

function disablePreviousButton(page) {
  if (page == 1) {
    previousBtn.disabled = true;
  } else {
    previousBtn.disabled = false;
  }
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

function showLoadingSpinner() {
  document.getElementById("loadingSpinner").style.display = "block";
}

function hideLoadingSpinner() {
  document.getElementById("loadingSpinner").style.display = "none";
}

function createProductionChart(datas) {
  // Extract unique crops and their total production
  const cropData = datas.reduce(function (acc, item) {
    const existingCropIndex = acc.findIndex((c) => c.Crop === item.Crop);
    //returns -1 if index is not found/ no element is found.

    let productionToAdd;
    productionToAdd = parseInt(item.Production, 10);

    if (!isNaN(productionToAdd) && item.Crop.toLowerCase() !== "coconut") {
      if (existingCropIndex !== -1) {
        acc[existingCropIndex].Production += productionToAdd;
      } else {
        acc.push({ Crop: item.Crop, Production: productionToAdd });
      }
    }

    return acc;
  }, []);

  // Extract labels and data for the chart
  const labels = cropData.map((item) => item.Crop);
  const productionData = cropData.map((item) => item.Production);

  // Create a bar chart
  const ctx = document.getElementById("productionChart").getContext("2d");
  const productionChart = new Chart(ctx, {
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
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });

  async function clickHandler2(click) {
    console.log(click);

    let points = productionChart.getElementsAtEventForMode(
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
      const cropSelected = productionChart.data.labels[index];
      console.log("Crop is", cropSelected);

      await getData();

      let newDatas = datas.filter((item) => item.Crop === cropSelected);

      generateTableData(newDatas);
      disablePreviousButton(page);
      disableNextButton(page);

      await getData();
    }
  }

  productionChart.canvas.onclick = clickHandler2;
}

function createYearChart(datas) {
  // Extract unique crops and their total production
  const yearData = datas.reduce(function (acc, item) {
    const existingYearIndex = acc.findIndex((c) => c.Year === item.Year);
    //returns -1 if index is not found/ no element is found.

    let productionToAdd;
    productionToAdd = parseInt(item.Production, 10);

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
  const ctx2 = document.getElementById("yearChart").getContext("2d");
  const productionChart = new Chart(ctx2, {
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
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });

  async function clickHandler(click) {
    console.log(click);

    let points = productionChart.getElementsAtEventForMode(
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
      const yearSelected = productionChart.data.labels[index];
      console.log(yearSelected);

      await getData();

      let newDatas = datas.filter((item) => item.Year === yearSelected);

      generateTableData(newDatas);
      disablePreviousButton(page);
      disableNextButton(page);

      await getData();
    }
  }

  productionChart.canvas.onclick = clickHandler;
}
