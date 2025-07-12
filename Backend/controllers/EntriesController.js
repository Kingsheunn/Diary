import EntriesService from "../services/EntriesService.js";
import { validateEntry } from "../validators/entryValidator.js";

class EntriesController {
  static async getAllEntries(req, res) {
    const entries = await EntriesService.getAllEntries(req.user.id);
    if (entries.length === 0) {
      return res.status(200).json({ entries: [], count: 0, status: "Success" });
    }
    res.status(200).json({
      entries,
      count: entries.length,
      status: "Success",
    });
  }

  static async getEntryById(req, res) {
    const entryId = parseInt(req.params.id, 10);

    if (isNaN(entryId) || entryId <= 0) {
      return res.status(400).json({ message: "Invalid entry ID" });
    }

    const entry = await EntriesService.getEntryById(entryId, req.user.id);

    if (!entry) {
      return res.status(404).json({
        message: "Entry not found!",
        status: "error",
      });
    }
    res.status(200).json({ entry, status: "Success" });
  }

  static async createEntry(req, res) {
    const { title, content } = req.body;
    const { error } = validateEntry(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const entry = await EntriesService.createEntry(req.user.id, title, content);
    return res.status(201).json(entry);
  }

  static async updateEntry(req, res) {
    const { title, content } = req.body;
    const entryId = parseInt(req.params.id, 10);
    
    if (isNaN(entryId) || entryId <= 0) {
      return res.status(400).json({ message: "Invalid entry ID" });
    }

    const { error } = validateEntry(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const updatedEntry = await EntriesService.updateEntry(
      title,
      content,
      entryId,
      req.user.id
    );
    if (!updatedEntry) {
      return res.status(404).json({
        message: "Entry not found!",
        status: "error",
      });
    }
    res.status(200).json(updatedEntry);
  }

  static async removeEntry(req, res) {
    const entryId = parseInt(req.params.id, 10);
    
    if (isNaN(entryId) || entryId <= 0) {
      return res.status(400).json({ message: "Invalid entry ID" });
    }

    const deletedEntry = await EntriesService.deleteEntry(
      entryId,
      req.user.id
    );

    if (!deletedEntry) {
      return res.status(404).json({
        message: "Entry not found or you do not have permission",
        status: "error",
      });
    }

    res.status(200).json({
      entry: deletedEntry,
      status: "Success",
      message: "Entry deleted successfully",
    });
  }
}

export default EntriesController;
