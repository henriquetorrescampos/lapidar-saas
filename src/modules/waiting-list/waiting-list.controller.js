import {
  getWaitingList,
  createWaitingEntry,
  updateWaitingEntry,
  deleteWaitingEntry,
} from "./waiting-list.service.js";

export async function getWaitingListController(req, res) {
  try {
    const list = await getWaitingList();
    res.json(list);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function createWaitingEntryController(req, res) {
  try {
    const entry = await createWaitingEntry(req.body);
    res.status(201).json(entry);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function updateWaitingEntryController(req, res) {
  try {
    const entry = await updateWaitingEntry(req.params.id, req.body);
    res.json(entry);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function deleteWaitingEntryController(req, res) {
  try {
    await deleteWaitingEntry(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
