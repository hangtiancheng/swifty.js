/**
 * Personal bookmarks column.
 *
 * Thin wrapper around the shared factory; binds `bucket: "personal"` and
 * declares `work` as the counterpart for the move action.
 */
import { createBookmarksView } from "./bookmarks-shared";

export default createBookmarksView({
  bucket: "personal",
  counterpart: "work",
  title: "Personal",
});
