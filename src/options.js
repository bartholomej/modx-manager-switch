class App {
  init() {
    this.managerTable = document.getElementById('managers-paths');
    this.buttonSave1 = document.getElementById('save');
    this.buttonSave2 = document.getElementById('save-2');
    this.buttonAdd1 = document.getElementById('add-record');
    this.buttonAdd2 = document.getElementById('add-record-2');

    this.somethingChanged = false;

    this.buttonSave1.addEventListener('click', () => {
      this.saveOptions();
    });
    this.buttonSave2.addEventListener('click', () => {
      this.saveOptions();
    });
    this.buttonAdd1.addEventListener('click', () => {
      this.setSomethingChanged(true);
      this.insertPathsTableRow(this.managerTable, { siteUrl: '', managerPath: '' });
    });
    this.buttonAdd2.addEventListener('click', () => {
      this.setSomethingChanged(true);
      this.insertPathsTableRow(this.managerTable, { siteUrl: '', managerPath: '' });
    });

    this.initialRender();
  }

  saveOptions() {
    this.saveOptionsManagersTable();
  }

  saveOptionsManagersTable() {
      if (this.managerTable) {
        const rows = this.managerTable.querySelectorAll('tr[data-record]');
        if (rows) {
          const paths = [];
          [].forEach.call(rows, (row) => {
            const siteUrl = row.querySelector('input[data-name="site_url"]').value;
            const managerPath = row.querySelector('input[data-name="manager_path"]').value;
            paths.push({
              siteUrl: this.rtrim(siteUrl, '/'),
              managerPath: managerPath.replace('/', ''),
            });
          });
          chrome.storage.sync.set({
            paths: paths,
          }, () => {
            console.log('Paths saved');
            this.setSomethingChanged(false);
          });
        } else {
          console.log('There are no records');
        }
      } else {
        console.warn('manager paths table not found');
      }
  }

  insertPathsTableRow(managerTable, path) {
    const tbody = managerTable ? managerTable.querySelector('tbody') : null;
    const newRow = tbody.insertRow(this.getRowsCount(managerTable));
    newRow.setAttribute('data-record', '');

    // First cell
    const newCell1 = newRow.insertCell(0);
    const input1 = document.createElement('input');
    input1.setAttribute('data-name', 'site_url');
    input1.type = 'text';
    input1.value = path.siteUrl;
    input1.addEventListener('input', () => {
      this.setSomethingChanged(true);
      this.refreshFullUris(newRow);
    })
    newCell1.appendChild(input1);

    // Second cell
    const newCell2 = newRow.insertCell(1);
    const input2 = document.createElement('input');
    input2.setAttribute('data-name', 'manager_path');
    input2.type = 'text';
    input2.value = path.managerPath;
    input2.addEventListener('input', () => {
      this.setSomethingChanged(true);
      this.refreshFullUris(newRow);
    })
    newCell2.appendChild(input2);

    // Third cell
    const newCell3 = newRow.insertCell(2);
    const link = document.createElement('a');
    link.setAttribute('href', this.generateManagerUri(path.siteUrl, path.managerPath));
    link.setAttribute('target', '_blank');
    link.innerHTML = this.generateManagerUri(path.siteUrl, path.managerPath);
    newCell3.appendChild(link);

    // Fourth cell
    const newCell4 = newRow.insertCell(3);
    const buttonRemove = document.createElement('button');
    buttonRemove.setAttribute('type', 'button');
    buttonRemove.className = 'button-remove button-base';
    buttonRemove.innerHTML = '&times;';
    buttonRemove.addEventListener('click', (e) => {
      e.target.parentNode.parentNode.remove();
      this.setSomethingChanged(true);
    });
    newCell4.appendChild(buttonRemove);
  }

  generateManagerUri(siteUrl, managerPath) {
    return this.rtrim(siteUrl, '/') + '/' + managerPath.replace('/', '');
  }

  rtrim(value, char) {
    if (value[value.length - 1] === char) {
      return value.slice(0, -1);
    }
    return value;
  }

  getRowsCount(managerTable) {
    if (managerTable) {
      const rows = managerTable.querySelectorAll('tr[data-record]');
      return rows ? rows.length : 0;
    }
    return 0;
  }

  setSomethingChanged(trueOrFalse) {
    this.somethingChanged = !!trueOrFalse;
    if (this.somethingChanged) {
      this.buttonSave1.removeAttribute('disabled');
      this.buttonSave2.removeAttribute('disabled');
    } else {
      this.buttonSave1.setAttribute('disabled', true);
      this.buttonSave2.setAttribute('disabled', true);
    }
  }

  refreshFullUris(row) {
    if (row) {
      const link = row.querySelector('a');
      const siteUrl = row.querySelector('input[data-name="site_url"]').value;
      const managerPath = row.querySelector('input[data-name="manager_path"]').value;
      if (link) {
        link.setAttribute('href', this.generateManagerUri(siteUrl, managerPath));
        link.innerHTML = this.generateManagerUri(siteUrl, managerPath);
      }
    }
  }

  initialRenderManagersPaths() {
    if (this.managerTable) {
      chrome.storage.sync.get('paths', (result) => {
        if (result && 'paths' in result && Array.isArray(result.paths)) {
          result.paths.forEach((path) => {
            this.insertPathsTableRow(this.managerTable, path);
          });
        } else {
          console.warn('Paths not found in storage');
        }
      });
    } else {
      console.warn('manager paths table not found');
    }
  }

  initialRender() {
    this.setSomethingChanged(false);
    this.initialRenderManagersPaths();
  }
};

const app = new App();
app.init();
