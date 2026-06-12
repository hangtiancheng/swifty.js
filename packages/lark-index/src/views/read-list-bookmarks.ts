/**
 * Reading list bookmarks column.
 *
 * Thin wrapper around the shared factory; binds `bucket: "readlist"` and
 * declares `personal` as the counterpart for the move action.
 */
import { createBookmarksView } from "./bookmarks-shared";

export default createBookmarksView({
  bucket: "read-list",
  counterpart: "personal",
  title: "Read List",
});
