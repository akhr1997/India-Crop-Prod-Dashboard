import { showLoadingSpinner, hideLoadingSpinner } from "./loadingSpinner.js";

let baseURL = "http://localhost:3000/api/data";
let datas = [];

export async function getData() {
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
