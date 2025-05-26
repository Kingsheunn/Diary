import EntriesModel from "../models/entries.js";

class EntriesService {
  static getAllEntries() {
    return EntriesModel.getAllEntries();
  }

   static getEntriesByUserId(userId) {
    return EntriesModel.getEntriesByUserId(userId);
  }

  static getEntryById(id) {
    return EntriesModel.getEntryById(id);
  }

  static createEntry(data) {
    return EntriesModel.createEntry(data);
  }

  static updateEntry(id, data) {
    return EntriesModel.updateEntry(id, data);
  }

  static deleteEntry(id) {
    return EntriesModel.deleteEntry(id);
  }
}

export default EntriesService;