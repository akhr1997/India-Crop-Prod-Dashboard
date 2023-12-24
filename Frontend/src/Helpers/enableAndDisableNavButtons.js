const previousBtn = document.getElementById("prevButton");
const nextBtn = document.getElementById("nextButton");

let datas = [];
let itemsPerPage = 15;
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

function getNumberOfPage(datas, itemsPerPage) {
  return Math.ceil(datas.length / itemsPerPage);
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

export { disableNextButton, disablePreviousButton };
