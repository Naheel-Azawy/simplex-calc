const simplex = require("./simplex.js");

([
    () => simplex.calc("20x1+40x2", [
        [ "4x1+3x2", 168 ],
        [ "2x1+3x2", 108 ],
        [ "x1+3x2",  96  ]
    ]),

    () => simplex.calc_mat([
        [ 1, 4, 3, 1, 0, 0, 56 ],
        [ 2, 2, 1, 0, 1, 0, 18 ],
        [ -1, -4, -2, 0, 0, 1, 0]
    ]),

    () => simplex.calc_mat([
        [ 1, 2, 4, 1, 0, 0, 8 ],
        [ 4, 4, 1, 0, 1, 0, 10 ],
        [ -5, -20, 1, 0, 0, 1, 0]
    ]),

    () => simplex.calc("10x1+3x2+x3", [
        [ "x1+5x2+5x3", 113 ],
        [ "x1+2x2+9x3", 236 ]
    ]),

    () => simplex.calc("2x1+3x2", [
        [ "-2x1+x2", 14 ],
        [ "-x1+x2", 35 ],
        [ "x2", 42 ]
    ]),

    () => simplex.calc("13x1+13x2", [
        [ "2x1+x2", 2 ],
        [ "x1+2x2", 26 ]
    ]),
]).forEach((test, i) => {
    console.log("######################");
    console.log(`Running test ${i}...`);
    console.log("######################");
    test();
    console.log("");
});
