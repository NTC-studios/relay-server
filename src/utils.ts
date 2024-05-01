import { readFileSync } from "fs";
const prohibitedIDs = readFileSync("./prohibitedIDs.txt", "utf-8").split("\n");

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);

export function makeLobbyID(length = 5) {
    const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";

    while (!result.length || prohibitedIDs.includes(result)) {
        for (let i = 0; i < length; i++)
            result += CHARSET.charAt(randomInt(0, CHARSET.length - 1));
    }

    return result;
}