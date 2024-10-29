/** @license GPL-3.0-or-later
 *
 * Copyright (C) 2024 8 Hobbies, LLC
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import { generateNewUrl } from "./main.js";
import { searchEngines } from "./search_engine.js";

// eslint-disable-next-line @typescript-eslint/no-deprecated
chrome.action.onClicked.addListener(async (tab) => {
  if (tab.url === undefined || tab.url.length === 0 || tab.id === undefined) {
    // No permission
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-deprecated
  await chrome.tabs.update(tab.id, {
    url: generateNewUrl(tab.url, searchEngines),
  });
});
