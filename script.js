const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTOY9WmGasf0YMnB1w3mpQYNIAF-C3b1j46K7JxckTOlapK4RdAZtofozukxHeSAl2IqwWzCxaxSqtg/pub?output=csv";

async function loadData() {
  const res = await fetch(SHEET_URL);
  const text = await res.text();

  const rows = text.split("\n").slice(1);

  return rows.map(r => {
    const cols = r.split("\t");
    return {
      page: cols[0],
      field: cols[1],
      value: cols.slice(2).join("\t")
    };
  });
}

function getPageData(data, page) {
  return data
    .filter(r => r.page === page)
    .reduce((acc, r) => {
      acc[r.field] = r.value;
      return acc;
    }, {});
}
