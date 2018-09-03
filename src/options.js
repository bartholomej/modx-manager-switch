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
    console.log(managerTable);
    if (managerTable) {
      const rows = managerTable.querySelector('tr');
    }
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

document.getElementById('save').addEventListener('click', saveOptions);
