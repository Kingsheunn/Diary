import EntriesService from "../services/EntriesService.js";
class EntriesController {
  static async getAllEntries(req, res) {
  try {
    const entries = await EntriesService.getAllEntries();
    res.status(200).json(entries); // <- This should return an array
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
}


  
  static async getByUserId(req, res) {
    const { userId } = req.params;
    const entries = await EntriesService.getEntriesByUserId(userId);
    res.json(entries);
  }

  static async getEntry(req, res) {
    const entries = await EntriesService.getEntryById(req.params.id);
    if (!entries) return res.status(404).json({ message: "Entry does not exist", status: "error" });

    res.status(200).json({ entries, status: "Success" });
  }

  static async createEntry(req, res) {
  try {
    const entry = await EntriesService.createEntry(req.body);
    res.status(201).json(entry); // <- Make sure you're returning this
  } catch (err) {
    res.status(500).json({ error: 'Failed to create entry' });
  }
}


  static async updateEntry(req, res) {
  try {
    const updatedEntry = await EntriesService.updateEntry(req.params.id, req.body);
    res.status(200).json(updatedEntry); // <- Ensure this returns the updated entry
  } catch (err) {
    res.status(500).json({ error: 'Failed to update entry' });
  }
}


  static async removeEntry(req, res) {
    const entry = await EntriesService.deleteEntry(req.params.id);
    if (!entry) return res.status(404).json({ message: "Entry does not exist", status: "error" });

    res.status(200).json({ entry, status: "Success", message: "Entry deleted successfully" });
  }
}

export default EntriesController;
