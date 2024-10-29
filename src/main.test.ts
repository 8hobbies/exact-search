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

describe("generateNewUrl", () => {
  interface BasicTestCase {
    name: string;
    input: string;
    expected: string;
  }

  function basicTest(
    prefix: string,
    testCases: readonly BasicTestCase[],
  ): void {
    describe(prefix, () => {
      for (const testCase of testCases) {
        test(testCase.name, () => {
          expect(
            generateNewUrl(`https://example.com/?${testCase.input}`, [
              { urlRegex: /^https:\/\/example\.com\//, queryParam: "q" },
            ]),
          ).toBe(`https://example.com/?${testCase.expected}`);
        });
      }
    });
  }

  basicTest("No query, then perform no change", [
    {
      name: "No param",
      input: "",
      expected: "",
    },
    {
      name: "Some irrelevant params",
      input: "irrelevant=param&nonsense=some",
      expected: "irrelevant=param&nonsense=some",
    },
  ]);

  basicTest("Other params do not affect the result", [
    {
      name: "One other param after q",
      input: "q=a&other=irrelevant",
      expected: "q=%22a%22&other=irrelevant",
    },
    {
      name: "One other param before q",
      input: "other=irrelevant&q=a",
      expected: "other=irrelevant&q=%22a%22",
    },
  ]);

  basicTest("No quotes in query, then all phrases are quoted", [
    {
      name: "Single phrase",
      input: "q=a",
      expected: "q=%22a%22",
    },
    {
      name: "Two phrases",
      input: "q=a+bcd",
      expected: "q=%22a%22+%22bcd%22",
    },
    {
      name: "Three phrases",
      input: "q=a+bcd+efg",
      expected: "q=%22a%22+%22bcd%22+%22efg%22",
    },
  ] as const);

  basicTest("Some phrases are quoted, then all phrases are quoted", [
    {
      name: "One phrase quoted and one not",
      input: "q=%22a%22+bcd",
      expected: "q=%22a%22+%22bcd%22",
    },
    {
      name: "Two phrases quoted and one not",
      input: "q=%22a%22+%22bcd%22+ef",
      expected: "q=%22a%22+%22bcd%22+%22ef%22",
    },
    {
      name: "Two phrases quoted and two not",
      input: "q=%22a%22+%22bcd%22+ef+gh",
      expected: "q=%22a%22+%22bcd%22+%22ef%22+%22gh%22",
    },
  ] as const);

  basicTest("Unquote if all phrases are quoted", [
    {
      name: "No phrases contain space",
      input: "q=%22a%22+%22bcd%22",
      expected: "q=a+bcd",
    },
    {
      name: "One phrase contains space",
      input: "q=%22a%22+%22b+cd%22",
      expected: "q=a+%22b+cd%22",
    },
  ]);

  basicTest("Quote handling", [
    {
      name: "One phrase with space is quoted and one not",
      input: "q=%22a+bcd%22+ef",
      expected: "q=%22a+bcd%22+%22ef%22",
    },
    {
      name: "One phrase with two spaces is quoted and one not",
      input: "q=%22a+b+cd%22+ef",
      expected: "q=%22a+b+cd%22+%22ef%22",
    },
    {
      name: "Two phrases with space are quoted and two not",
      input: "q=%22a%22+%22bcd%22+%22ef+gh%22+i+jk",
      expected: "q=%22a%22+%22bcd%22+%22ef+gh%22+%22i%22+%22jk%22",
    },
    {
      name: "Two quotes are present with the first quote succeeding an alphabet",
      input: "q=a%22cd%22+ef",
      expected: "q=%22a%22+%22cd%22+%22ef%22",
    },
    {
      name: "Only one quote is present",
      input: "q=a+cd%22+ef",
      expected: "q=%22a%22+%22cd%22%22+%22ef%22",
    },
    {
      name: "Three quotes are present with no space between the first two",
      input: "q=a+%22cd%22+ef%22",
      expected: "q=%22a%22+%22cd%22+%22ef%22%22",
    },
    {
      name: "Three quotes are present with a space between the first two",
      input: "q=a+%22cd+%22ef%22",
      expected: "q=%22a%22+%22cd+%22+%22ef%22%22",
    },
    {
      name: "Three quotes are present with the first quote succeeding an alphabet",
      input: "q=a%22cd%22+ef%22",
      expected: "q=%22a%22+%22cd%22+%22ef%22%22",
    },
  ]);

  test("Don't do anything if the URL doesn't match", () => {
    const url = "http://www.example.org" as const;
    expect(
      generateNewUrl(url, [
        {
          urlRegex: /^https:\/\/www\.example\.org/,
          queryParam: "q",
        },
      ] as const),
    ).toBe(url);
  });

  test("Don't do anything if input is not a URL even if it matches the regexp", () => {
    const url = "https//www.example.org" as const;
    const urlRegex = /^https\/\/www\.example\.org/;
    // Sanity check
    expect(url).toMatch(urlRegex);
    expect(
      generateNewUrl(url, [
        {
          urlRegex,
          queryParam: "q",
        },
      ] as const),
    ).toBe(url);
  });

  test("Non-q search param works", () => {
    const param = "rrr" as const;
    const url = `https://www.example.com/?${param}=term` as const;
    expect(
      generateNewUrl(url, [
        {
          urlRegex: /^https:\/\/www.example.com/,
          queryParam: param,
        },
      ] as const),
    ).toBe(`https://www.example.com/?${param}=%22term%22`);
  });

  describe("Regexpes of builtin search engines match", () => {
    for (const testCase of [
      {
        name: "Bing",
        input: "https://www.bing.com/search?q=a",
        expected: "https://www.bing.com/search?q=%22a%22",
      },
      {
        name: "DuckDuckGo",
        input: "https://www.duckduckgo.com?q=a",
        expected: "https://www.duckduckgo.com/?q=%22a%22",
      },
      {
        name: "Ecosia",
        input: "https://www.ecosia.org/search?q=a",
        expected: "https://www.ecosia.org/search?q=%22a%22",
      },
      {
        name: "Google",
        input: "https://www.google.com/search?q=a",
        expected: "https://www.google.com/search?q=%22a%22",
      },
      {
        name: "Yahoo",
        input: "https://www.yahoo.com/search?p=a",
        expected: "https://www.yahoo.com/search?p=%22a%22",
      },
      {
        name: "Yandex",
        input: "https://www.yandex.com/search?text=a",
        expected: "https://www.yandex.com/search?text=%22a%22",
      },
    ] as const satisfies BasicTestCase[]) {
      test(testCase.name, () => {
        expect(generateNewUrl(testCase.input, searchEngines)).toBe(
          testCase.expected,
        );
      });
    }
  });
});
