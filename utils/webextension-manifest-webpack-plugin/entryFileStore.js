class EntryFileStore {
  constructor() {
    this.entrypoints = {};
  }

  addEntrypoint(request, path) {
    this.entrypoints[request] = path;
  }
}

module.exports = new EntryFileStore();
