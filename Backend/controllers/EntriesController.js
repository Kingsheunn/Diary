import EntriesService from "../services/EntriesService.js";
import { validateEntry } from '../validators/entryValidator.js';

class EntriesController {
  static getAllEntries(req, res) {
    const entries = EntriesService.getAllEntries();
    res.status(200).json({ entries, status: "Ok", message: "All entries" });
  }

  static getEntry(req, res) {
    const entry = EntriesService.getEntryById(req.params.id);
    if (!entry) return res.status(404).json({ message: "Entry does not exist", status: "error" });

    res.status(200).json({ entry, status: "Success" });
  }

  static addEntry(req, res) {
    const { error } = validateEntry(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message, status: "Failed" });

    const entry = EntriesService.addEntry(req.body);
    res.status(201).json({ entry, status: "Success", message: "Entry added successfully" });
  }

  static updateEntry(req, res) {
    const { error } = validateEntry(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message, status: "Failed" });

    const entry = EntriesService.updateEntry(req.params.id, req.body);
    if (!entry) return res.status(404).json({ message: "Entry does not exist", status: "error" });

    res.status(200).json({ entry, status: "Success", message: "Entry updated successfully" });
  }

  static removeEntry(req, res) {
    const entry = EntriesService.removeEntry(req.params.id);
    if (!entry) return res.status(404).json({ message: "Entry does not exist", status: "error" });

    res.status(200).json({ entry, status: "Success", message: "Entry deleted successfully" });
  }
}

export default EntriesController;
