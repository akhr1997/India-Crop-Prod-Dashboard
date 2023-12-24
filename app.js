//Grabbing HTML Elements
const dataTable = document.getElementById("data-table");
const nextBtn = document.getElementById("nextButton");
const previousBtn = document.getElementById("prevButton");
const areaTableHead = document.getElementById("area-table-head");
const yearTabelHead = document.getElementById("year-table-head");
const areaTabelHead = document.getElementById("area-table-head");
const stateSelect = document.getElementById("state-select");
const currentPageNumberH2 = document.getElementById("current-page-number");
const dataHeaders = document.querySelectorAll(".table-head");
const table = document.getElementById("csv-table");

//Arrays Calculate average Production for each Crop for Graphing!
const Crops = [];
const Years = [];
const averageProduction = [];
let groupedData = new Map();

let baseURL = "http://localhost:3000/api/data";

let datas = [];
let stateArray = [];
let itemsPerPage = 15;
let currentPage = 1;
let page = 1;
let myChart1 = null;
let myChart2 = null;
let sortedData = [];

document.getElementById("current-page-number").innerText = currentPage;

nextBtn.addEventListener("click", goToNextPage, false);
previousBtn.addEventListener("click", goToPreviousPage, false);
stateSelect.addEventListener("change", changeStates);
// areaTabelHead.addEventListener("click", areaHeadClicked);
dataHeaders.forEach((head) => {
  head.addEventListener("click", headClicked);
});

async function changeStates() {
  if (stateSelect.value === "Select a State") {
    // await getData();
    console.log("datas object on changing states using dropdown: ", datas);

    generateTableData(datas);
    disablePreviousButton(page);
    disableNextButton(page);
    return;
  }

  await getData();
  console.log("selected value: ", stateSelect.value);
  console.log("datas before filter: ", datas);
  datas = datas.filter((item) => item.State === stateSelect.value);
  console.log("datas after filter: ", datas);

  generateTableData(datas);
  disablePreviousButton(page);
  disableNextButton(page);
}

async function renderTable() {
  //invoke the fetch function here so it fetches only when we render the table
  await getData();

  console.log("Have Access to the huge data object here!!");

  createProductionChart(datas);
  createYearChart(datas);

  console.log("data in render table function: ");

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
    console.log("sortedData:", sortedData);
    generateTableData(sortedData);
    table.classList.remove("sorted-by-descending");
    return;
    //    a.name.localeCompare(b.name));
  }
  console.log("clicked: ", event.target.innerText);
  console.log("unsortedData: ", datas);
  sortedData = datas.sort((a, b) => b[filterKey].localeCompare(a[filterKey]));
  // sortedData = datas.sort((a, b) => b[filterKey] - a[filterKey]);
  console.log("sortedData:", sortedData);
  generateTableData(sortedData);

  table.classList.add("sorted-by-descending");
}

renderTable(currentPage);

//Fetching data from the RestAPI
async function getData() {
  showLoadingSpinner();
  const response = await fetch(baseURL);
  const dataJSON = await response.json();
  datas = dataJSON;
  hideLoadingSpinner();
  createOptionElements(datas);
}

//Helper Functions
function createOptionElements(datas) {
  datas.forEach((data) => {
    if (!stateArray.includes(data.State)) {
      stateArray.push(data.State);
      // console.log("here");
      let newOption = document.createElement("option");
      newOption.text = data.State;
      newOption.value = data.State;
      // console.log(newOption);
      stateSelect.append(newOption);
    }
  });
}

function disableNextButton(page) {
  if (page == getNumberOfPage()) {
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
  console.log("clicked next");
  if (currentPage * itemsPerPage < datas.length) {
    currentPage++;
    page++;
    console.log("currentPage", currentPage);
    document.getElementById("current-page-number").innerText = currentPage;
    // renderTable(currentPage);
    // headClicked();
    changeStates();
  }
}

function goToPreviousPage() {
  console.log("clicked prev");
  if (currentPage > 1) {
    currentPage--;
    page--;
    document.getElementById("current-page-number").innerText = currentPage;
    // renderTable(currentPage);
    // headClicked();
    changeStates();
  }
}

function getNumberOfPage() {
  return Math.ceil(datas.length / itemsPerPage);
}

// async function createChart1Arrays() {
//   await getData();
//   console.log("in createChart1Arrays: ", datas.length);
//   console.log("in createChart1Arrays: ", datas.length);

//   groupedData = datas.reduce((result, obj) => {
//     const Crop = obj.Crop;
//     const Production = parseInt(obj.Production, 10); // Convert Production to a number

//     if (!isNaN(Production)) {
//       if (result.has(Crop)) {
//         // If Crop exists in the Map, update total Production and count
//         const existingCrop = result.get(Crop);
//         existingCrop.totalProduction += Production;
//         existingCrop.count += 1;
//       } else {
//         // If Crop doesn't exist, add a new entry to the Map
//         result.set(Crop, { Crop, totalProduction: Production, count: 1 });
//       }
//     }

//     return result;
//   }, new Map());

//   groupedData.forEach((item) => {
//     Crops.push(item.Crop);
//     averageProduction.push(item.totalProduction / item.count);
//   });

//   console.log("Crops:", Crops);
//   console.log("Average Production:", averageProduction);
//   // destroy();

//   // drawChart1();
// }

// createChart1Arrays();

// function createChart2Arrays(datas) {
//   console.log("in createChart2Arrays: ", datas.length);

//   const groupedData = datas.reduce((result, obj) => {
//     const Year = obj.Year;
//     const Production = parseInt(obj.Production, 10); // Convert Production to a number

//     if (!isNaN(Production)) {
//       if (result.has(Year)) {
//         // If Crop exists in the Map, update total Production and count
//         const existingCrop = result.get(Year);
//         existingCrop.totalProduction += Production;
//         existingCrop.count += 1;
//       } else {
//         // If Crop doesn't exist, add a new entry to the Map
//         result.set(Year, { Year, totalProduction: Production, count: 1 });
//       }
//     }

//     return result;
//   }, new Map());

//   groupedData.forEach((item) => {
//     Years.push(item.Year);
//     averageProduction.push((item.totalProduction / item.count) * 3);
//   });

//   console.log("Years:", Years);
//   console.log("Average Production:", averageProduction);
//   // drawChart2();
// }

// function drawChart1() {
//   //data block
//   const data = {
//     labels: Crops,
//     datasets: [
//       {
//         label: "Productions in tonnes per crop",
//         data: averageProduction,
//         borderWidth: 1,
//       },
//     ],
//   };

//   //config block
//   const config = {
//     type: "bar",
//     data,
//   };

//   if (myChart1 != null) {
//     myChart1.destroy();
//   }

//   const ctx = document.getElementById("myChart-1").getContext("2d");
//   //init or render block
//   myChart1 = new Chart(ctx, config);
// }

// function drawChart2() {
//   //data block
//   const data = {
//     labels: Years,
//     datasets: [
//       {
//         label: "Productions in tonnes per year",
//         data: averageProduction,
//         borderWidth: 1,
//       },
//     ],
//   };

//   //config block
//   const config = {
//     type: "bar",
//     data,
//   };

//   if (myChart2 != null) {
//     myChart2.destroy();
//   }

//   const ctx = document.getElementById("myChart-2").getContext("2d");
//   //init or render block
//   myChart2 = new Chart(ctx, config);
// }

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

    // if ((item.Crop = "Coconut")) {
    //   productionToAdd = parseInt((item.Production * 1.4) / 1000);
    // } else {
    productionToAdd = parseInt(item.Production, 10);
    // }

    if (!isNaN(productionToAdd) && item.Crop.toLowerCase() !== "coconut") {
      if (existingCropIndex !== -1) {
        acc[existingCropIndex].Production += productionToAdd;
      } else {
        acc.push({ Crop: item.Crop, Production: productionToAdd });
      }
    }

    return acc;
  }, []);

  // Now you can use cropData outside the reduce function
  console.log(cropData);

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
}

function createYearChart(datas) {
  // Extract unique crops and their total production
  const yearData = datas.reduce(function (acc, item) {
    const existingYearIndex = acc.findIndex((c) => c.Year === item.Year);
    //returns -1 if index is not found/ no element is found.

    let productionToAdd;

    // if ((item.Crop = "Coconut")) {
    //   productionToAdd = parseInt((item.Production * 1.4) / 1000);
    // } else {
    productionToAdd = parseInt(item.Production, 10);
    // }

    if (!isNaN(productionToAdd) && item.Year.toLowerCase() !== "coconut") {
      if (existingYearIndex !== -1) {
        acc[existingYearIndex].Production += productionToAdd;
      } else {
        acc.push({ Year: item.Year, Production: productionToAdd });
      }
    }

    return acc;
  }, []);

  // Now you can use cropData outside the reduce function
  console.log(yearData);

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
}
