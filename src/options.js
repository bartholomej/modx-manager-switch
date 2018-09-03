// Saves options to chrome.storage
function saveOptions() {
  console.group('saveOptions');
  saveOptionsManagersTable();

  // var color = document.getElementById('color').value;
  // var likesColor = document.getElementById('like').checked;
  // chrome.storage.sync.set({
  //   favoriteColor: color,
  //   likesColor: likesColor
  // }, function() {
  //   // Update status to let user know options were saved.
  //   var status = document.getElementById('status');
  //   status.textContent = 'Options saved.';
  //   setTimeout(function() {
  //     status.textContent = '';
  //   }, 750);
  // });
  console.groupEnd('saveOptions');
}

function saveOptionsManagersTable() {
    const managerTable = document.getElementById('managers-pathes');

    if (managerTable) {
      const rows = managerTable.querySelectorAll('tr[data-record]');
      if (rows) {
        const pathes = [];
        [].forEach.call(rows, (row) => {
          const siteUrl = row.querySelector('input[data-name="site_url"]').value;
          const managerPath = row.querySelector('input[data-name="manager_path"]').value;
          pathes.push({
            siteUrl: siteUrl,
            managerPath: managerPath,
          });
        });
        chrome.storage.sync.set({
          pathes: pathes,
        }, () => {
          console.log('Pathes saved');
        });
      } else {
        console.log('There are no records');
      }
    } else {
      console.warn('manager pathes table not found');
    }
}

function renderPathesTable() {
  console.group('renderPathesTable');
  const managerTable = document.getElementById('managers-pathes');
  const tbody = managerTable ? managerTable.querySelector('tbody') : null;
  if (managerTable && tbody) {
    chrome.storage.sync.get('pathes', function(result) {
      console.log(result);
      if (result && 'pathes' in result && Array.isArray(result.pathes)) {
        console.log(result.pathes);
        result.pathes.forEach((path) => {
          const newRow = tbody.insertRow(0);

          // First cell
          // <input type="text" data-name="site_url" value="https://github.com/" />
          const newCell1 = newRow.insertCell(0);
          const input1 = document.createElement('input');
          input1.setAttribute('data-name', 'site_url');
          input1.type = 'text';
          input1.value = path.siteUrl;
          newCell1.appendChild(input1);

          const newCell2 = newRow.insertCell(0);
          const input2 = document.createElement('input');
          input2.setAttribute('data-name', 'manager_path');
          input2.type = 'text';
          input2.value = path.managerPath;
          newCell2.appendChild(input2);

          const newCell3 = newRow.insertCell(0);
          newCell3.innerHTML = path.siteUrl + path.managerPath;

          const newCell4 = newRow.insertCell(0);
          const buttonRemove = document.createElement('button');
          buttonRemove.setAttribute('type', 'button');
          buttonRemove.className = 'button-remove';
          buttonRemove.addEventListener('click', () => {
            console.log('removing...');
          });
          newCell4.appendChild(buttonRemove);
        });
      } else {
        console.warn('Pathes not found in storage');
      }
    });
  } else {
    console.warn('manager pathes table not found');
  }
  console.groupEnd('renderPathesTable');
}

function render() {
  renderPathesTable();
}

// function restore_options() {
//   chrome.storage.sync.get({
//     favoriteColor: 'red',
//     likesColor: true
//   }, function(items) {
//     document.getElementById('color').value = items.favoriteColor;
//     document.getElementById('like').checked = items.likesColor;
//   });
// }

// document.addEventListener('DOMContentLoaded', restore_options);

render();

document.getElementById('save').addEventListener('click', saveOptions);
