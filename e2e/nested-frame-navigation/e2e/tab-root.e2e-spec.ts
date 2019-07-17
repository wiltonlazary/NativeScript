import { AppiumDriver, createDriver, logWarn, nsCapabilities } from "nativescript-dev-appium";

import { Screen, playersData, teamsData } from "./screen";
import * as shared from "./shared.e2e-spec";
import { suspendTime, appSuspendResume, dontKeepActivities, transitions } from "./config";

// NOTE: TabTop is Android only scenario (for iOS we will essentially execute 2x TabBottom)
const roots = ["TabTop", "TabBottom"];

const rootType = "tab-root";
describe(rootType, async function () {
    let driver: AppiumDriver;
    let screen: Screen;

    before(async function () {
        nsCapabilities.testReporter.context = this;
        logWarn(`====== ${rootType} ========`);
        driver = await createDriver();
        screen = new Screen(driver);
        if (dontKeepActivities) {
            await driver.setDontKeepActivities(true);
        }

        driver.defaultWaitTime = 8000;
    });

    after(async function () {
        if (dontKeepActivities) {
            await driver.setDontKeepActivities(false);
        }
        await driver.quit();
        console.log("Quit driver!");
    });

    afterEach(async function () {
        if (this.currentTest.state === "failed") {
            await driver.logTestArtifacts(this.currentTest.title);
        }
    });

    for (let index = 0; index < roots.length; index++) {
        const root = roots[index];
        describe(`${rootType}-${root}-scenarios:`, async function () {

            before(async function () {
                nsCapabilities.testReporter.context = this;
            });

            for (let index = 0; index < transitions.length; index++) {
                const transition = transitions[index];

                const playerOne = playersData[`playerOne${transition}`];
                const playerTwo = playersData[`playerTwo${transition}`];
                const teamOne = teamsData[`teamOne${transition}`];
                const teamTwo = teamsData[`teamTwo${transition}`];

                describe(`${rootType}-${root}-transition-${transition}-scenarios:`, async function () {

                    before(async function () {
                        nsCapabilities.testReporter.context = this;

                        if (transition === "Flip" &&
                            driver.isAndroid && parseInt(driver.platformVersion) === 19) {
                            // TODO: known issue https://github.com/NativeScript/NativeScript/issues/6798
                            console.log("skipping flip transition tests on api level 19");
                            this.skip();
                        }
                    });

                    it("loaded home page", async function () {
                        await screen.loadedHome();
                    });

                    it(`loaded ${root} root with frames`, async function () {
                        await screen[`navigateTo${root}RootWithFrames`]();
                        await screen[`loaded${root}RootWithFrames`]();
                    });

                    it("loaded players list", async function () {
                        await screen.loadedPlayersList();
                    });

                    it("loaded player details and go back twice", async function () {
                        await shared.testPlayerNavigated(playerTwo, screen);

                        if (appSuspendResume) {
                            await driver.backgroundApp(suspendTime);
                            await driver.waitForElement(playerTwo.name); // wait for player
                        }

                        await shared.testPlayerNavigatedBack(screen, driver);

                        if (appSuspendResume) {
                            await driver.backgroundApp(suspendTime);
                            await driver.waitForElement(playerOne.name); // wait for players list
                        }

                        await shared.testPlayerNavigated(playerTwo, screen);
                        await shared.testPlayerNavigatedBack(screen, driver);
                    });

                    it("toggle teams tab", async function () {
                        await screen.toggleTeamsTab();

                        if (appSuspendResume) {
                            await driver.backgroundApp(suspendTime);
                            await driver.waitForElement(teamOne.name); // wait for teams list
                        }
                    });

                    it("loaded teams list", async function () {
                        await screen.loadedTeamsList();
                    });

                    it("mix player and team list actions and go back", async function () {
                        await screen.togglePlayersTab();

                        if (appSuspendResume) {
                            await driver.backgroundApp(suspendTime);
                            await driver.waitForElement(playerOne.name); // wait for players list
                        }

                        await screen.loadedPlayersList();

                        await shared.testPlayerNavigated(playerTwo, screen);

                        if (driver.isIOS) {
                            if (appSuspendResume) {
                                await driver.backgroundApp(suspendTime);
                                await driver.waitForElement(playerTwo.name); // wait for player
                            }
                        }

                        await screen.toggleTeamsTab();

                        if (driver.isIOS) {
                            // TODO: run in background from appium breaks the test. Investigate the issue, once with the app and with appium
                            if (appSuspendResume) {
                                await driver.backgroundApp(suspendTime);
                                await driver.waitForElement(teamOne.name); // wait for teams list
                            }
                        }

                        await screen.loadedTeamsList();

                        await shared.testTeamNavigated(teamTwo, screen);

                        if (appSuspendResume) {
                            await driver.backgroundApp(suspendTime);
                            await driver.waitForElement(teamTwo.name); // wait for team
                        }

                        await screen.togglePlayersTab();

                        if (appSuspendResume) {
                            await driver.backgroundApp(suspendTime);
                            await driver.waitForElement(playerTwo.name); // wait for player
                        }

                        await screen.loadedPlayerDetails(playerTwo);

                        await screen.toggleTeamsTab();

                        await screen.goBackToTeamsList();
                        await screen.loadedTeamsList();

                        await screen.togglePlayersTab();

                        await screen.goBackToPlayersList();
                        await screen.loadedPlayersList();
                    });

                    it("loaded home page again", async function () {
                        await screen.resetToHome();
                        await screen.loadedHome();
                    });
                });
            }
        });
    }
});
