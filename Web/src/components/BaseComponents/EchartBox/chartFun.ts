export const getSectors = (num: number = 3) => { };

export const getRandomOrder = (num: number = 3) => {
    let arr: Array<number> = [];
    while (arr.length < num) {
        let randomNum = Math.floor(Math.random() * num) + 1;
        if (arr.indexOf(randomNum) === -1) {
            arr.push(randomNum);
        }
    }
    return arr;
};
