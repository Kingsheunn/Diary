import entries from "../models/entries.js";

class EntriesService {
  static getAllEntries() {
    return entries;
  }

  static getEntryById(id) {
    return entries.find(entry => entry.id === parseInt(id, 10));
  }

  static addEntry(data) {
    const newEntry = { id: entries.length + 1, ...data };
    entries.push(newEntry);
    return newEntry;
  }

  static updateEntry(id, data) {
    const entry = entries.find(e => e.id === parseInt(id, 10));
    if (!entry) return null;

    Object.assign(entry, data);
    return entry;
  }

  static removeEntry(id) {
    const index = entries.findIndex(e => e.id === parseInt(id, 10));
    if (index === -1) return null;

    const [deleted] = entries.splice(index, 1);
    return deleted;
  }
}

export default EntriesService;
