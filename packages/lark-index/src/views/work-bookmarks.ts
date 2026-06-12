/**
 * Work bookmarks column.
 *
 * Thin wrapper around the shared factory; binds `bucket: "work"` and
 * declares `personal` as the counterpart for the move action.
 */
import { createBookmarksView } from "./bookmarks-shared";

export default createBookmarksView({
  bucket: "work",
  counterpart: "personal",
  title: "Work",
});
