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

import type { SearchEngine, UrlParam } from "./search_engines.js";
import { isBlank } from "@8hobbies/utils";

/** Gets the search engine currently the tab is on.
 */
function getSearchEngine(
  url: string,
  searchEngines: readonly SearchEngine[],
): SearchEngine | null {
  for (const searchEngine of searchEngines) {
    if (searchEngine.urlRegex.exec(url)) {
      return searchEngine;
    }
  }

  return null;
}

/** Indicates whether a string is quoted.
 */
function isQuoted(s: string): boolean {
  return s.length >= 2 && s.at(0) === '"' && s.at(-1) === '"';
}

/** Splits the query string into search phrases.
 */
function splitQuery(query: string): string[] {
  const result = [];

  let startOfCurPhrase = 0;
  for (let i = 0; i < query.length; ++i) {
    if (isBlank(query[i])) {
      // Blank character
      if (i > startOfCurPhrase) {
        result.push(query.slice(startOfCurPhrase, i));
      }
      startOfCurPhrase = i + 1;
    } else if (query[i] === '"') {
      // Quote

      // Look for the next quote and they form a phrase
      const nextQuotePosition = query.indexOf('"', i + 1);
      if (nextQuotePosition === -1) {
        // No next quote found. This quote is merely a literal character.
        continue;
      }

      // The current quote marks the end of a phrase
      if (i > startOfCurPhrase) {
        result.push(query.slice(startOfCurPhrase, i));
      }

      result.push(query.slice(i, nextQuotePosition + 1));
      i = nextQuotePosition;
      startOfCurPhrase = i + 1;
    }
  }

  if (startOfCurPhrase < query.length) {
    result.push(query.slice(startOfCurPhrase));
  }

  return result;
}

/** Quote all queries of a URL. */
function quoteQueries(parsedUrl: URL, queryParam: string): URL {
  const params = parsedUrl.searchParams;
  const query = params.get(queryParam);
  if (query === null) {
    // No query found.
    return parsedUrl;
  }

  const phrases = splitQuery(query);
  const allQuoted = phrases.every(isQuoted);
  let newQuery: string;
  if (allQuoted) {
    // All phrases are quoted. Unquote those that don't have any blank characters.
    newQuery = phrases
      .map((s) => ([...s].some(isBlank) ? s : s.slice(1, s.length - 1)))
      .join(" ");
  } else {
    // Not all phrases are quoted. Quote the unquoted.
    newQuery = phrases.map((s) => (isQuoted(s) ? s : `"${s}"`)).join(" ");
  }
  params.set(queryParam, newQuery);

  return parsedUrl;
}

/** Add or remove the verbatim param based on its presence. */
function addOrRemoveVerbatimParam(
  parsedUrl: URL,
  verbatimParam: Readonly<UrlParam>,
): URL {
  const params = parsedUrl.searchParams;
  const verbatimValue = params.get(verbatimParam.key);
  if (verbatimValue === null || verbatimValue !== verbatimParam.value) {
    // Verbatim param not found
    params.set(verbatimParam.key, verbatimParam.value);
  } else {
    params.delete(verbatimParam.key);
  }

  return parsedUrl;
}

/** Generates the expected new URL from the current one.
 */
export function generateNewUrl(
  url: string,
  searchEngines: readonly SearchEngine[],
): string {
  const searchEngine = getSearchEngine(url, searchEngines);
  if (searchEngine === null) {
    // Uninteresting URL.
    return url;
  }

  const parsedUrl = URL.parse(url);
  if (parsedUrl === null) {
    // Not a URL.
    console.error(`${url} is not a URL.`);
    return url;
  }

  if (searchEngine.verbatimParam === undefined) {
    return quoteQueries(parsedUrl, searchEngine.queryParam).toString();
  } else {
    return addOrRemoveVerbatimParam(
      parsedUrl,
      searchEngine.verbatimParam,
    ).toString();
  }
}
