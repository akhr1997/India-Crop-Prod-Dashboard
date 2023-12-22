//Grabbing HTML Elements
const dataTable = document.getElementById("data-table");
const nextBtn = document.getElementById("nextButton");
const previousBtn = document.getElementById("prevButton");
const areaTableHead = document.getElementById("area-table-head");
const stateSelect = document.getElementById("state-select");
const currentPageNumberH2 = document.getElementById("current-page-number");

let baseURL = "http://localhost:3000/api/data";

let datas = [];
let stateArray = [];
let itemsPerPage = 15;
let currentPage = 1;
let page = 1;

document.getElementById("current-page-number").innerText = currentPage;

nextBtn.addEventListener("click", goToNextPage, false);
previousBtn.addEventListener("click", goToPreviousPage, false);
stateSelect.addEventListener("change", changeStates);

async function changeStates() {
  if (stateSelect.value === "Select a State") {
    await getData();
    console.log("datas in if: ", datas);
    generateTableData(datas);
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

  console.log("data in render table function: ");

  generateTableData(datas);
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

renderTable(currentPage);

//Fetching data from the RestAPI
async function getData() {
  const response = await fetch(baseURL);
  const dataJSON = await response.json();
  datas = dataJSON;
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
    changeStates();
  }
}

function getNumberOfPage() {
  return Math.ceil(datas.length / itemsPerPage);
}
