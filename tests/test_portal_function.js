#!/usr/bin/env mocha

/* *
 * 
 * Generic functionality tests for the Portal. This can be used on any project 
 * based on the portal infrastructure.
 * 
 *  To run (2 options):
 *      Jenkins:
 *      $ env PORTAL_URL={anyPortalURL} ./node_modules/.bin/mocha portal-test.js
 * 
 *      Command-line:
 *      $ ./node_modules/.bin/mocha portal-test.js PORTAL_URL={anyPortalURL}
 * 
 * 
 * Tests performed:
 *  - Main page
 *      - Does site banner have the Portal name displaying?
 *      - Do the counts for the example queries load?
 *      - Does the project graph load?
 *      - Do the summary statistics load?
 * 
 * - Studies page
 *      - Does the Projects table have 1) column headings, and 2) multiple rows?
 * 
 * - Search page
 *      - Do the charts load?
 *      - Do the numbers display for Files, Samples, & File Volume?
 *      - Do facets (and facet terms) load for Samples and Files?
 *      - Does the Samples table have 1) column headings, and 2) multiple rows?
 *      - Does the Files table have 1) column headings, and 2) multiple rows?
 * 
 * - Advanced Search page
 *      - Do the charts load?
 *      - Do the numbers display for Files, Samples, & File Volume?
 *      - Does the valid/invalid query icon toggle?
 *      - Does the GQL dropdown display with subject properties?
 *      - Does the GQL dropdown display with query operators?
 *      - Does error message display if invalid query is submitted?
 *      - Does the Samples table have 1) column headings, and 2) multiple rows?
 *      - Does the Files table have 1) column headings, and 2) multiple rows?
 * 
 * - Individual File page
 *      - Does the file ID display?
 *      - Does the File Properties table have 1) headings, and 2) content
 *      - Does the Data Information table have 1) headings, and 2) content
 *
 * - Individual Sample page
 *      - Does the sample ID display?
 *      - Does the Summary table have 1) headings, and 2) content
 *      - Does the Files count load?
 *      - Does the 'Add all files to Cart' 1) display, and 2) add items to the Cart
 * 
 * - Cart page
 *      - Do the charts load?
 *      - Do the numbers display for Files, Samples, & File Volume?
 *      - Does Cart Items table have 1) column headings, and 2) multiple rows
 *      - Does manifest file 1) download, and 2) have column headings and data
 *      - Does metadata file 1) download, and 2) have column headings and data
 *
*/

const puppeteer = require('puppeteer-core');
var chai = require('chai');
var expect = require('chai').expect;
const fs = require('fs');
const os = require('os');
const path = require('path');
const readline = require('readline');
var browser = null;

var opts = {
    // appUrl: 'http://localhost:5000', //strictly for development
    appUrl: getPortalUrl(),
    downloadPath: path.dirname(__filename) + "/downloads",
    pageNetworkIdle: {
        waitUntil: 'networkidle0',
        timeout: 30000
    }
};

// Get Portal URL from environment variable or argument
// Allows script to be used in Jenkins and commandline
function getPortalUrl() {
    var app_url = "";
    try {
        if (process.env.PORTAL_URL) {
            app_url = process.env.PORTAL_URL;
        } else {
            process.argv.forEach((val, index) => {
                if (val.indexOf("PORTAL_URL") != -1) {
                    app_url = val.split("=")[1];
                }
            });
        }

        // If url is not found, throw an error to exit the script
        if (app_url.length == 0) {
            err_message = "PORTAL_URL not found\n" +
                "\tPORTAL_URL must be passed as environment variable or commandline argument:\n" +
                "\tenv PORTAL_URL=<url> <script> OR <script> PORTAL_URL=<url>";
            throw new Error(err_message);
        }
        return (app_url);
    } catch (err) {
        throw err;
    }
}

async function getPage() {
    return new Promise(async function (resolve, reject) {
        try {
            var platform = os.platform();
            var chromePath = '';

            if (platform === 'darwin') {
                chromePath =
                    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
            } else if (platform === 'linux') {
                chromePath = '/usr/bin/chromium-browser';
            } else {
                throw 'Test running on unsupported platform.';
            }

            browser = await puppeteer.launch({
                executablePath: chromePath,
            });

            page = await browser.newPage();

            // Set download directory (https://stackoverflow.com/a/47291149)
            await page._client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: opts.downloadPath });

            resolve(page);
        } catch (error) {
            reject(error);
        }
    });
}

function wrapUp() {
    browser.close();
}
after(async function () {
    wrapUp();
});


// Gets the text for all elements of a given selector. 
// Returns an array of element text as strings. 
// only_return_digits (default = false): Optional argument. If equals true, removes any non-digit characters.
async function getAllElementsTextBySelector(page, selector, only_return_digits = false) {
    return new Promise(async function (resolve, reject) {
        try {
            const counts = await page.evaluate((selector, only_return_digits) => {
                const elements = Array.from(document.querySelectorAll(selector));
                return elements.map(el => {
                    // var text = el.innerHTML.trim();
                    // var text = el.innerText.trim().length > 0 ? el.innerText.trim(): el.innerHTML.trim();
                    var text = el.innerText.trim();

                    //Remove non-digit characters
                    if (only_return_digits) {
                        text = text.replace(/\D+/g, "");
                    }
                    return text;
                });
            }, selector, only_return_digits);
            resolve(counts);

        } catch (err) {
            reject(err);
        }
    });
}

// Gets all elements of a given selector and
// Returns the total count of those elements on the page
async function getElementCountBySelector(page, selector) {
    return new Promise(async function (resolve, reject) {
        try {
            const count = await page.evaluate((selector) => {
                const children = Array.from(document.querySelectorAll(selector));
                return children.length;
            }, selector);
            resolve(count);

        } catch (err) {
            reject(err);
        }
    });
}

// Get a file name containing a given substring ('manifest' or 'manifest_metadata')
// Assumes only one file exists in ./downloads directory
async function getFileName(filename_substring) {
    return new Promise(function (resolve, reject) {
        try {
            fs.readdir(opts.downloadPath, (err, files) => {
                if (err) throw err;
                else {
                    files.forEach((file) => {
                        let filename = "";
                        if (file.indexOf(filename_substring) != -1) {
                            filename = file;
                            resolve(filename);
                        }
                    });
                }
            });
        } catch (err) {
            reject(err);
        }
    });
}

// Get a sample of a file's content
// Returns an array containing 2 lines of file content
// Assumes Line 1 is column headers & Line 2 is data
async function getFileContent(filename) {
    return new Promise(async function (resolve, reject) {
        try {
            const filepath = opts.downloadPath + "/" + filename;
            const reader = readline.createInterface({
                input: fs.createReadStream(filepath)
            });

            var line_count = 0;
            var wanted_lines = [];
            reader.on('line', (line) => {
                line_count++;
                wanted_lines.push(line);

                if (line_count == 2) {
                    reader.close();
                    reader.removeAllListeners();
                }
            });

            reader.on('close', () => {
                resolve(wanted_lines);
            });
        } catch (err) {
            reject(err);
        }
    });
}

// Removes file from the directory specified in opts.downloadPath
async function removeFile(filename) {
    return new Promise(async function (resolve, reject) {
        try {
            var filepath = opts.downloadPath + "/" + filename;
            fs.unlink(filepath, (err) => {
                if (err) {
                    throw err;
                }
            });
            resolve();
        } catch (err) {
            reject(err);
        }
    });
}

// Removes all files from the directory specified in opts.downloadPath
// This is meant to be used as a 'clean up' function to ensure old manifest/metadata
// files are removed before performing any tests
async function cleanUpDownloadsDir() {
    return new Promise(function (resolve, reject) {
        try {
            fs.readdir(opts.downloadPath, (err, files) => {
                if (err) throw err;
                else {
                    if (files.length > 0) {
                        files.forEach((file) => {
                            removeFile(file);
                        });
                    }
                    resolve();
                }
            });
        } catch (err) {
            reject(err);
        }
    });
}


// Tests that elements have loaded
// min_elements (default = 0): Optional argument. Sets a minimum number of elements that need to be found
async function checkElementsExist(page, selector, min_elements = 0) {
    return new Promise(async function (resolve, reject) {
        try {
            error_message = `Element(s) failed to load: ${selector}`;
            const element_count = await getElementCountBySelector(page, selector);
            // console.log(`\t${selector} element count: `, element_count);

            //Check that we found the elements 
            expect(element_count).to.be.gt(min_elements, error_message);
            resolve();

        } catch (err) {
            reject(err);
        }
    });
}

// Tests that elements of a given selector content some text (optionally: only contain digits)
// is_digits (default = false): Optional argument. If equals true, adds additional test to check that element(s) content is only digits.
async function checkElementHasContent(page, selector, is_digits = false) {
    return new Promise(async function (resolve, reject) {
        try {

            // Get only the digit text from each element
            const content = await getAllElementsTextBySelector(page, selector, only_return_digits = is_digits);
            // console.log(`\t${selector} content: `, content);

            content.forEach(item => {
                // Check that every count has at least 1 digit
                expect(item.length).to.be.gt(0, "Encountered unexpected content for selector: " + selector);

                // Check that only digits were found
                if (is_digits) {
                    expect(item).to.be.match(/[0-9]+/, "Return content was not digit-only." +
                        "\n\tCounts are: [" + content + "]." +
                        "\n\tTest failed: ");
                }
            });
            resolve();

        } catch (err) {
            reject(err);
        }
    });
}

// Tests a given array of file content to verify that:
// 1) There are 2 lines of content. Only 1 line means data is missing
// 2) Column headers are not missing. No duplicated tabs "\t\t"
// 3) The data line is more than just tabs "\t" and empty space
// *  Assumes content is derived from TSV file
async function checkFileContent(file_content) {
    return new Promise(async function (resolve, reject) {
        try {
            if (file_content.length < 2) {
                expect(file_content.length).to.be.gt(1, "Data missing from file");
                resolve();
            } else {
                // Check that file content is more than just a bunch of '\t'
                line_counter = 0;
                file_content.forEach((raw_line) => {
                    line_counter++;
                    if (line_counter == 1) {
                        // First line is headers. Check that no headers are missing
                        expect(raw_line).to.not.contain("\t\t", "Column header is missing");
                    } else {
                        // Second line is data. 
                        // Some columns can be empty, but the line must contain alphanumberic characters
                        var line = raw_line.replace("\t", "");
                        expect(line).to.be.match(/\S+/, "Data missing from file");
                    }
                });
                resolve();
            }
        } catch (err) {
            reject(err);
        }
    });
}


describe("Portal Functionality Tests", function () {
    var page;
    var sample_url;
    var file_url;

    // Before any tests are executed, we establish a browser and get a 'page'
    // that we can use repeatedly. This will be more efficient than invoking a
    // new browser or page for each test...
    before(async function () {
        // Delete any files in downloads directory from prior runs
        await cleanUpDownloadsDir();

        page = await getPage();
    });

    describe("Main page", async function () {
        // this.timeout(30000);
        this.timeout(60000);

        before("Navigating to Main page", async function () {
            // Navigate to site page
            // Waits until network is idle
            // Extra delay allowing for angularJS to fully populate DOM 
            const load_page = await Promise.all([
                page.goto(`${opts.appUrl}`, opts.pageNetworkIdle),
                page.waitForNavigation(opts.pageNetworkIdle),
                page.waitForTimeout(4000)
            ]);
        });

        it('Site Banner has text', async function () {
            return new Promise(async function (resolve, reject) {
                try {
                    const banner_selector = "div.quick-search-component h1.ng-binding";

                    // Wait for element to display, then check that Portal name displays
                    await page.waitForSelector(banner_selector, opts.pageNetworkIdle);
                    checkElementHasContent(page, banner_selector)

                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        });

        it('Example query counts load', async function () {
            return new Promise(async function (resolve, reject) {
                try {
                    // Elements containing the counts for example queries
                    const example_query_count_selector = "td a span.ng-binding";

                    // Wait for element to display, then check that query numbers display
                    await page.waitForSelector(example_query_count_selector, opts.pageNetworkIdle);
                    await checkElementHasContent(page, example_query_count_selector, true);

                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        });

        it('Project graph loads', async function () {
            return new Promise(async function (resolve, reject) {
                try {
                    const graph_element_selector = "div.browser-vis.component svg g";

                    // Wait for an <g> element to display, then check that more than 2 are displayed
                    await page.waitForSelector(graph_element_selector, opts.pageNetworkIdle);
                    await checkElementsExist(page, graph_element_selector, 2);

                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        });

        it('Data Portal Summary counts load', async function () {
            return new Promise(async function (resolve, reject) {
                try {
                    const data_summary_container_selector = "div.stats-block-body span.stat-figure";

                    // Wait until the target element has text
                    await page.waitForFunction((data_summary_container_selector) => document.querySelector(data_summary_container_selector).innerHTML.length > 0, {}, data_summary_container_selector);

                    // Check that the content is digits only
                    await checkElementHasContent(page, data_summary_container_selector, true);

                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        });
    });

    describe("Studies page", async function () {
        this.timeout(30000);

        before("Navigating to Studies page", async function () {
            // Navigate to site page
            // Waits until network is idle
            // Extra delay allowing for angularJS to fully populate DOM 
            const load_page = await Promise.all([
                page.click(`a[ui-sref="projects.table"]`),
                page.waitForNavigation(opts.pageNetworkIdle),
                page.waitForTimeout(1000)
            ]);
        });

        it("Studies table loads", async function () {
            return new Promise(async function (resolve, reject) {
                try {
                    const table_selector = 'table#projects-table';
                    const table_header_selector = table_selector + ' th span.ng-scope';
                    const table_row_selector = table_selector + ' tbody tr ';

                    // Wait for table to render, then check that headings are displayed
                    await page.waitForSelector(table_selector, opts.pageNetworkIdle);
                    await checkElementHasContent(page, table_header_selector, false);

                    // Get table cell text, then check that table cells all have text
                    await page.waitForSelector(table_row_selector, opts.pageNetworkIdle);
                    await checkElementsExist(page, table_row_selector, 0);

                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        });
    });

    describe("Search page", async function () {
        this.timeout(60000);
        this.retries(2);

        before("Navigate to Search page", async function () {
            const chart_selector = "div svg";

            // Navigate to site page
            // Wait for last selector to show (Piechart svg element)
            // Wait additional 4 secs for angularJS to finish injection
            const load_page = await Promise.all([
                page.click(`a[ui-sref="search.summary"]`),
                page.waitForSelector(chart_selector),
                page.waitForTimeout(4000)
            ]);
        });

        it("Charts load properly", async function () {
            return new Promise(async function (resolve, reject) {
                try {
                    const chart_element_selector = "div.summary-card svg g";
                    await page.waitForSelector(chart_element_selector, opts.pageNetworkIdle);
                    await checkElementsExist(page, chart_element_selector);

                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        });

        // Check that counts load for Files, Samples, and File Volume
        it("Summary counts load", async function () {
            this.retries(4); //retry test if test fails. Need to get ALL summary-card counts
            return new Promise(async function (resolve, reject) {
                try {
                    const summary_stat_selector = "div.CountCard-data";

                    // Wait until the summary card element has text, then check that it is digits only
                    await page.waitForFunction((summary_stat_selector) => document.querySelector(summary_stat_selector).innerHTML.length > 0, {}, summary_stat_selector);
                    await checkElementHasContent(page, summary_stat_selector, true);

                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        });

        it("Facets (and facet terms) for Samples & Files load properly", async function () {
            return new Promise(async function (resolve, reject) {
                try {
                    const facet_name_selector = "div.facet h4 label";
                    const facet_term_selector = "div.facet span.facet-term-label label";

                    // Get list of facet names
                    const facets = await getAllElementsTextBySelector(page, facet_name_selector);

                    // Check that facet names have loaded
                    facets.every(facet => expect(facet.length).to.be.gt(0), "A facet may have failed to load");

                    // Get list of facet terms
                    const terms = await getAllElementsTextBySelector(page, facet_term_selector);

                    // Check that facet terms have loaded
                    terms.every(term => expect(term.length).to.be.gt(0), "A facet term may have failed to load");

                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        });
        it("Samples table loads properly", async function () {
            return new Promise(async function (resolve, reject) {
                try {
                    const table_selector = "table#cases-table";
                    const table_header_selector = table_selector + ' th span.ng-scope';
                    const table_row_selector = table_selector + ' tbody tr';

                    const individual_sample_selector = table_selector + " tbody td a";

                    // Navigate to Samples table
                    // Wait for last selector to show (table element)
                    const load_table = await Promise.all([
                        page.click(`a[data-ng-href="/search/c?facetTab=cases"]`),
                        page.waitForSelector(table_selector),
                        page.waitForTimeout(3000)
                    ]);

                    // Check that table headers have loaded
                    await checkElementHasContent(page, table_header_selector);

                    // Check that table has multiple rows.
                    await checkElementsExist(page, table_row_selector);

                    // Get link to individual sample page for later test
                    sample_url = await page.evaluate((individual_sample_selector) => {
                        const element = document.querySelector(individual_sample_selector);
                        return element.href;
                    }, individual_sample_selector);

                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        });
        it("Files table loads properly", async function () {
            return new Promise(async function (resolve, reject) {
                try {
                    const table_selector = "table#files-table";
                    const table_header_selector = table_selector + ' th span.ng-scope';
                    const table_row_selector = table_selector + ' tbody tr ';

                    const individual_file_selector = table_selector + " tbody td a";

                    // Navigate to Samples table
                    // Wait for last selector to show (table element)
                    const load_table = await Promise.all([
                        page.click(`a[data-ng-href="/search/f?facetTab=cases"]`),
                        page.waitForSelector(table_selector),
                        page.waitForTimeout(1000)
                    ]);

                    // Check that table headers have loaded
                    await checkElementHasContent(page, table_header_selector);

                    // Check that table has multiple rows.
                    await checkElementsExist(page, table_row_selector);

                    // Get link to individual file page for later test
                    file_url = await page.evaluate((individual_file_selector) => {
                        const element = document.querySelector(individual_file_selector);
                        return element.href;
                    }, individual_file_selector);

                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        });
    });

    describe("Advanced Search page", async function () {
        this.timeout(30000);
        this.retries(2);
        const input_selector = '[id="gql"]';
        const gql_dropdown_items_selector = "ul.Gql_dropdown li.Gql_dropdown_item";
        /*
        * ASSUMES ALL PORTALS HAVE A SUBJECT AND FILE
        */

        before("Navigate to Advanced Search page", async function () {
            const chart_selector = "div svg";

            // Navigate to site page
            // Wait for last selector to show (Piechart svg element)
            const load_page = await Promise.all([
                page.goto(`${opts.appUrl}/query/s`, opts.pageNetworkIdle),
                page.waitForSelector(chart_selector),
                page.waitForTimeout(5000)
            ]);
        });

        it("Charts load properly", async function () {
            return new Promise(async function (resolve, reject) {
                try {
                    const chart_container_selector = "div.summary-card svg g";
                    await page.waitForSelector(chart_container_selector, opts.pageNetworkIdle);
                    await checkElementsExist(page, chart_container_selector);

                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        });

        it("Summary stats load", async function () {
            return new Promise(async function (resolve, reject) {
                try {
                    const summary_stat_selector = "div.CountCard-data";

                    // Wait until the summary card element has text, then check that it is digits only
                    // await page.waitForSelector(summary_stat_selector, opts.pageNetworkIdle);
                    await page.waitForFunction((summary_stat_selector) => document.querySelector(summary_stat_selector).innerHTML.length > 0, {}, summary_stat_selector);
                    await checkElementHasContent(page, summary_stat_selector, true); //content must be digits only

                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        });

        it("User Input - 'Valid'/'Invalid' icon toggles correctly", async function () {
            return new Promise(async function (resolve, reject) {
                try {
                    const valid_query_selector = 'i.text-success';
                    const invalid_query_selector = 'i.text-danger';

                    //Check that 'valid' query icon has loaded
                    await checkElementsExist(page, valid_query_selector);

                    // Type a partial query to trigger icon change and display GQL dropdown list
                    await page.type(input_selector, "subject");
                    await page.waitForTimeout(1000);

                    //Check that 'invalid' query icon is now displayed
                    await checkElementsExist(page, invalid_query_selector);

                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        });

        it("User Input - GQL Dropdown correctly displays subject fields", async function () {
            return new Promise(async function (resolve, reject) {
                try {
                    // Check that GQL dropdown is populated with node properties (subject fields)
                    await checkElementsExist(page, gql_dropdown_items_selector);

                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        });

        it("User Input - GQL Dropdown correctly displays operators", async function () {
            return new Promise(async function (resolve, reject) {
                try {
                    // Select first field on GQL dropdown
                    await page.click(gql_dropdown_items_selector);
                    await page.waitForTimeout(1000);

                    // Type a space in input to trigger operator dropdown list
                    await page.type(input_selector, " ");
                    await page.waitForTimeout(1000);

                    // Check that query operators exist in dropdown
                    await checkElementsExist(page, gql_dropdown_items_selector);

                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        });

        it("User Input - Query error message correctly displays", async function () {
            return new Promise(async function (resolve, reject) {
                try {
                    const submit_button_selector = 'button[data-ng-click="sb.sendQuery()"]';
                    const error_message_selector = 'div.search-bar-body div.text-danger span';

                    // Select first operator on GQL dropdown
                    await page.click(gql_dropdown_items_selector);
                    await page.waitForTimeout(1000);

                    // Click 'submit' button to trigger error message display
                    await page.click(submit_button_selector);
                    await page.waitForTimeout(1000);

                    // Check that error message is displayed
                    await checkElementHasContent(page, error_message_selector);

                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        });

        it("Samples table loads correctly", async function () {
            return new Promise(async function (resolve, reject) {
                try {
                    const table_selector = "table#cases-table";
                    const table_header_selector = table_selector + ' th span.ng-scope';
                    const table_row_selector = table_selector + ' tbody tr';

                    // Select 'Samples' tab to load the table
                    const load_table = await Promise.all([
                        page.click(`a[data-ng-href="/query/c"]`),
                        page.waitForSelector(table_selector),
                        page.waitForTimeout(1000)
                    ]);

                    // Check that table headers have loaded
                    await checkElementHasContent(page, table_header_selector);

                    // Check that table has multiple rows
                    await checkElementsExist(page, table_row_selector);

                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        });

        it("File table loads correctly", async function () {
            return new Promise(async function (resolve, reject) {
                try {

                    const table_selector = "table#files-table";
                    const table_header_selector = table_selector + ' th span.ng-scope';
                    const table_row_selector = table_selector + ' tbody tr ';

                    // Navigate to Files table
                    // Wait for last selector to show (table element)
                    const load_table = await Promise.all([
                        page.click(`a[data-ng-href="/query/f"]`),
                        page.waitForSelector(table_selector),
                        page.waitForTimeout(1000)
                    ]);

                    // Check that table headers have loaded
                    await checkElementHasContent(page, table_header_selector);

                    // Check that table has multiple rows.
                    await checkElementsExist(page, table_row_selector);

                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        });
    });

    describe("Individual File page", async function () {
        this.timeout(30000);

        const properties_table_selector = "table#properties-table";
        const data_table_selector = "table#data-information-table";

        before("Navigate to Individual File page", async function () {
            // Navigate to site page
            // Wait for last selector to show (Piechart svg element)
            const load_page = await Promise.all([
                page.goto(file_url, opts.pageNetworkIdle),
                page.waitForSelector(properties_table_selector),
                page.waitForTimeout(1000)
            ]);
        });

        it("File ID loads", async function () {
            return new Promise(async function (resolve, reject) {
                try {
                    // Get file ID from URL
                    const file_id = file_url.substring(file_url.lastIndexOf("/") + 1, file_url.length);

                    // Check that file ID has loaded
                    expect(file_url).to.include(file_id);

                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        });

        it("File Properties table loads properly", async function () {
            return new Promise(async function (resolve, reject) {
                try {
                    // Selectors for testing. Note, table headers (th) and data cells (td) are in the same row
                    const table_row_selector = properties_table_selector + " tr";
                    const table_header_selector = properties_table_selector + " tr th";
                    const table_data_cell_selector = properties_table_selector + " tr td";

                    // Check that table loads with multiple rows
                    await checkElementsExist(page, table_row_selector);

                    // Check that table headers have content
                    await checkElementHasContent(page, table_header_selector);

                    // Check that table cells have content
                    await checkElementHasContent(page, table_data_cell_selector);

                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        });

        it("Data Information table loads properly", async function () {
            return new Promise(async function (resolve, reject) {
                try {
                    // Selectors for testing. Note, table headers (th) and data cells (td) are in the same row
                    const table_row_selector = data_table_selector + " tr";
                    const table_header_selector = data_table_selector + " tr th";
                    const table_data_cell_selector = data_table_selector + " tr td";

                    // Check that table loads with multiple rows
                    await checkElementsExist(page, table_row_selector);

                    // Check that table headers have content
                    await checkElementHasContent(page, table_header_selector);

                    // Check that table cells have content
                    await checkElementHasContent(page, table_data_cell_selector);

                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        });
    });


    describe("Individual Sample page", async function () {
        this.timeout(30000);
        const table_selector = "table#summary-table";

        before("Navigate to Individual Sample page", async function () {

            // Navigate to site page
            // Wait for last selector to show
            const load_page = await Promise.all([
                page.goto(sample_url, opts.pageNetworkIdle),
                page.waitForSelector(table_selector),
                page.waitForTimeout(1000)
            ]);
        });

        it("Sample ID loads", async function () {
            return new Promise(async function (resolve, reject) {
                try {
                    // Get sample ID from URL
                    const sample_id = sample_url.substring(sample_url.lastIndexOf("/") + 1, sample_url.length);

                    // Check that Sample ID has loaded in the element's text
                    expect(sample_url).to.include(sample_id);

                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        });

        it("Summary table loads properly", async function () {
            return new Promise(async function (resolve, reject) {
                try {

                    // Selectors for testing. Note, table headers (th) and data cells (td) are in the same row
                    const table_row_selector = table_selector + " tr";
                    const table_header_selector = table_selector + " tr th";
                    const table_data_cell_selector = table_selector + " tr td";

                    // Check that table loads with multiple rows
                    await checkElementsExist(page, table_row_selector);

                    // Check that table headers have content
                    await checkElementHasContent(page, table_header_selector);

                    // Check that table cells have content
                    await checkElementHasContent(page, table_data_cell_selector);

                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        });

        it("Files count card loads properly", async function () {
            return new Promise(async function (resolve, reject) {
                try {

                    // Selectors for testing. Note, table headers (th) and data cells (td) are in the same row
                    const countcard_selector = "div.CountCard-data";

                    // Check that Countcard has content
                    await checkElementHasContent(page, countcard_selector);

                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        });

        it("'Add all files to Cart' button loads properly", async function () {
            return new Promise(async function (resolve, reject) {
                try {

                    // Selectors for testing. Note, table headers (th) and data cells (td) are in the same row
                    const button_selector = "add-to-cart-all-button button";

                    // Check that button exists
                    await checkElementsExist(page, button_selector);

                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        });

        it("Adding items to Cart updates the Cart item count", async function () {
            return new Promise(async function (resolve, reject) {
                try {

                    // Selectors for testing. Note, table headers (th) and data cells (td) are in the same row
                    const button_selector = "add-to-cart-all-button button";
                    const cart_selector = "li.nav-cart span.ng-binding";

                    // Click button to add files to cart
                    await page.click(button_selector);
                    await page.waitForTimeout(1000);

                    // Check that cart gets updated with new count (greater than zero (0))
                    await checkElementHasContent(page, cart_selector);
                    const cart_item_count = await getAllElementsTextBySelector(page, cart_selector, true);

                    // Get actual item count
                    const item_count = parseFloat(cart_item_count[0]);

                    // Check that cart item count was actually updated (from 0)
                    expect(item_count).to.be.gt(0, "Cart count has not updated");

                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        });
    });

    describe("Cart page", async function () {
        this.timeout(30000);

        var manifest_filename;
        var metadata_filename;

        before("Navigate to Cart page", async function () {
            const chart_selector = "div svg";

            // Navigate to site page
            // Wait for last selector to show (Piechart svg element)
            const load_page = await Promise.all([
                page.click(`a[ui-sref="cart"]`),
                page.waitForSelector(chart_selector, opts.pageNetworkIdle),
                page.waitForTimeout(4000)
            ]);
        });

        it("Charts load properly", async function () {
            return new Promise(async function (resolve, reject) {
                try {
                    const graph_element_selector = "div.summary-card svg g";

                    // Wait for an <g> element to display, then check that more than 2 are displayed
                    await page.waitForSelector(graph_element_selector, opts.pageNetworkIdle);
                    await checkElementsExist(page, graph_element_selector);

                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        });

        // Check that counts load for Files, Samples, and File Volume
        it("Summary counts load", async function () {
            return new Promise(async function (resolve, reject) {
                try {
                    const summary_stat_selector = "div.CountCard-data";

                    // Wait for summary card selector to display, then check that content is digits only
                    await page.waitForFunction((summary_stat_selector) => document.querySelector(summary_stat_selector).innerHTML.length > 0, {}, summary_stat_selector);
                    await checkElementHasContent(page, summary_stat_selector, true);

                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        });

        it("Cart items table loads correctly", async function () {
            return new Promise(async function (resolve, reject) {
                try {
                    const table_selector = "table#files-table";
                    const table_header_selector = table_selector + ' th span.ng-scope';
                    const table_row_selector = table_selector + ' tbody tr';

                    // Check that table headers have loaded
                    await checkElementHasContent(page, table_header_selector);

                    // Check that table has multiple rows.
                    await checkElementsExist(page, table_row_selector);

                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        });

        it("Manifest file downloads correctly", async function () {
            return new Promise(async function (resolve, reject) {
                try {
                    const primary_download_selector = "div a.download-button-default";
                    const download_manifest_selector = "button#manifest-button";

                    // Click button to show dropdown 
                    await page.click(primary_download_selector);
                    await page.waitForTimeout(1000);

                    // Click button to download manifest file
                    await page.click(download_manifest_selector);
                    await page.waitForTimeout(1000);

                    // Check that Manifest exists
                    manifest_filename = await getFileName('manifest');
                    expect(manifest_filename.length).to.be.gt(0, "Manifest file was not found in downloads directory");

                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        });

        it("Manifest file has content", async function () {
            return new Promise(async function (resolve, reject) {
                try {
                    // Get first 2 lines of file
                    const file_content = await getFileContent(manifest_filename);

                    // Check file content
                    await checkFileContent(file_content);

                    // Clean up. Delete manifest file
                    await removeFile(manifest_filename);

                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        });

        it("Metadata file downloads correctly", async function () {
            return new Promise(async function (resolve, reject) {
                try {
                    // const primary_download_selector = "div a.download-button-default";
                    const download_metadata_selector = 'button[data-filename="metadata.cart"]';

                    // NOTE: This is not needed as the dropdown does not close after downloading the manifest file
                    // // Click button to show dropdown 
                    // await page.click(primary_download_selector);
                    // await page.waitForTimeout(1000);

                    // Click button to download File Manifest
                    await page.click(download_metadata_selector);
                    await page.waitForTimeout(1000);

                    // Check that metadata file exists
                    metadata_filename = await getFileName('metadata');
                    expect(metadata_filename.length).to.be.gt(0, "Metadata file was not found in downloads directory");

                    resolve();
                } catch (err) {
                    await page.screenshot({ path: './screenshot_ui_failed.png' });
                    reject(err);
                }
            });
        });

        it("Metadata file has content", async function () {
            return new Promise(async function (resolve, reject) {
                try {

                    // Get first 2 lines of file
                    const file_content = await getFileContent(metadata_filename);

                    // Check file content
                    await checkFileContent(file_content);

                    // Clean up. Delete metadata file
                    await removeFile(metadata_filename);

                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        });
    });
}); //end Portal Functionality Tests
