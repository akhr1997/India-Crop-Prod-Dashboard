//Grabbing HTML Elements
const dataTable = document.getElementById("data-table");
const nextBtn = document.getElementById("nextButton");
const previousBtn = document.getElementById("prevButton");

let baseURL = "http://localhost:3000/api/data";

let datas = [];
let itemsPerPage = 10;
let currentPage = 1;

nextBtn.addEventListener("click", goToNextPage, false);
previousBtn.addEventListener("click", goToPreviousPage, false);

async function renderTabel(page = 1) {
  //invoke the fetch function here so it fetches only when we render the table
  await getData();

  //create table entries for each data
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
      data += `<td>${eachData.Year}</td>`;
      data += `<td>${eachData.Crop}</td>`;
      data += `<td>${eachData.District}</td>`;
      data += `<td>${eachData.Area}</td>`;
      data += `<td>${eachData.Production}</td>`;
      data += `<td>${eachData.Yield}</td>`;
      ("<tr>");
    });
  dataTable.innerHTML = data;

  disablePreviousButton(page);
  disableNextButton(page);
}

renderTabel(currentPage);

//Fetching data from the RestAPI
async function getData() {
  const response = await fetch(baseURL);
  const dataJSON = await response.json();
  datas = dataJSON;
  // fetch(baseURL)
  //   .then((response) => response.json())
  //   .then((dataJSON) => {
  //     datas = dataJSON;
  //     console.log("dataaa", datas);
  //     // You can continue your logic here after the data is fetche
  //   })
  //   .catch((error) => {
  //     console.error("Error fetching data:", error);
  //     // Handle the error as needed
  //   });
}

//Helper Functions
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
    renderTabel(currentPage);
  }
}

function goToPreviousPage() {
  console.log("clicked prev");
  if (currentPage > 1) {
    currentPage--;
    renderTabel(currentPage);
  }
}

function getNumberOfPage() {
  return Math.ceil(datas.length / itemsPerPage);
}
