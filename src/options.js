// Saves options to chrome.storage
function saveOptions() {
  saveOptionsManagersTable();
}

function saveOptionsManagersTable() {
    const managerTable = document.getElementById('managers-paths');

    if (managerTable) {
      const rows = managerTable.querySelectorAll('tr[data-record]');
      if (rows) {
        const paths = [];
        [].forEach.call(rows, (row) => {
          const siteUrl = row.querySelector('input[data-name="site_url"]').value;
          const managerPath = row.querySelector('input[data-name="manager_path"]').value;
          paths.push({
            siteUrl: siteUrl,
            managerPath: managerPath,
          });
        });
        chrome.storage.sync.set({
          paths: paths,
        }, () => {
          console.log('Paths saved');
        });
      } else {
        console.log('There are no records');
      }
    } else {
      console.warn('manager paths table not found');
    }
}

function renderPathsTable() {
  const managerTable = document.getElementById('managers-paths');
  if (managerTable) {
    chrome.storage.sync.get('paths', function(result) {
      if (result && 'paths' in result && Array.isArray(result.paths)) {
        result.paths.forEach((path) => {
          insertPathsTableRow(managerTable, path);
        });
      } else {
        console.warn('Paths not found in storage');
      }
    });
  } else {
    console.warn('manager paths table not found');
  }
}

function insertPathsTableRow(managerTable, path) {
  const tbody = managerTable ? managerTable.querySelector('tbody') : null;
  const newRow = tbody.insertRow(getRowsCount(managerTable));
  newRow.setAttribute('data-record', '');

  // First cell
  const newCell1 = newRow.insertCell(0);
  const input1 = document.createElement('input');
  input1.setAttribute('data-name', 'site_url');
  input1.type = 'text';
  input1.value = path.siteUrl;
  input1.addEventListener('input', () => {
    refreshFullUris(newRow);
  })
  newCell1.appendChild(input1);

  // Second cell
  const newCell2 = newRow.insertCell(1);
  const input2 = document.createElement('input');
  input2.setAttribute('data-name', 'manager_path');
  input2.type = 'text';
  input2.value = path.managerPath;
  input2.addEventListener('input', () => {
    refreshFullUris(newRow);
  })
  newCell2.appendChild(input2);

  // Third cell
  const newCell3 = newRow.insertCell(2);
  const link = document.createElement('a');
  link.setAttribute('href', generateManagerUri(path.siteUrl, path.managerPath));
  link.setAttribute('target', '_blank');
  link.innerHTML = generateManagerUri(path.siteUrl, path.managerPath);
  newCell3.appendChild(link);

  // Fourth cell
  const newCell4 = newRow.insertCell(3);
  const buttonRemove = document.createElement('button');
  buttonRemove.setAttribute('type', 'button');
  buttonRemove.className = 'button-remove';
  buttonRemove.innerHTML = '&times;';
  buttonRemove.addEventListener('click', () => {
    console.log('removing...');
  });
  newCell4.appendChild(buttonRemove);
}

function generateManagerUri(siteUrl, managerPath) {
  return siteUrl + managerPath;
}

function getRowsCount(managerTable) {
  if (managerTable) {
    const rows = managerTable.querySelectorAll('tr[data-record]');
    return rows ? rows.length : 0;
  }
  return 0;
}

function refreshFullUris(row) {
  if (row) {
    const link = row.querySelector('a');
    const siteUrl = row.querySelector('input[data-name="site_url"]').value;
    const managerPath = row.querySelector('input[data-name="manager_path"]').value;
    if (link) {
      link.setAttribute('href', generateManagerUri(siteUrl, managerPath));
      link.innerHTML = generateManagerUri(siteUrl, managerPath);
    }
  }
}

function render() {
  renderPathsTable();
}

render();

document.getElementById('save').addEventListener('click', saveOptions);
document.getElementById('add-record').addEventListener('click', () => {
  const managerTable = document.getElementById('managers-paths');
  insertPathsTableRow(managerTable, { siteUrl: '', managerPath: '' });
});
