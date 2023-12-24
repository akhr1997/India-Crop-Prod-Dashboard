export function getNumberOfPage(datas, itemsPerPage) {
  return Math.ceil(datas.length / itemsPerPage);
}
