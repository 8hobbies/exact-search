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

export interface SearchEngine {
  urlRegex: RegExp;
  queryParam: string;
}

export const searchEngines = [
  {
    urlRegex: /^https?:\/\/www\.bing\.com\/search\?/,
    queryParam: "q",
  },
  {
    urlRegex: /^https?:\/\/www\.duckduckgo\.com\?/,
    queryParam: "q",
  },
  {
    urlRegex: /^https?:\/\/www\.ecosia\.org\/search\?/,
    queryParam: "q",
  },
  {
    urlRegex: /^https?:\/\/www\.google\.com\/search\?/,
    queryParam: "q",
  },
  {
    urlRegex: /^https?:\/\/www\.yahoo\.com\/search\?/,
    queryParam: "p",
  },
  {
    urlRegex: /^https?:\/\/www\.yandex\.com\/search\?/,
    queryParam: "text",
  },
] as const satisfies SearchEngine[];
