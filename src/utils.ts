const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);

export function makeLobbyID(length = 5) {
    const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    let result = "";
    for (let i = 0; i < length; i++) {
        const randomChar = CHARSET.charAt(randomInt(0, CHARSET.length - 1));
        result += randomChar;
    }

    return result;
}