function build_mat(objective, constrains) {

    const clean = s => {
        s = s.split(' ').join('');     // remove spaces
        s = s.split('-').join('+-');   // keep -ve signes
        if (s.startsWith("+-")) {      // if starts with "+-"
            s = s.substring(1);        // remove the first "+"
        }
        s = s.split('-x').join('-1x'); // fix -x
        s = s.split('+');              // split terms
        let a = new Array(s.length).fill(0);
        for (let i in a) {
            let t = s[i].split('x');
            // starting from x1
            a[Number(t[1]) - 1] = t[0] === '' ? 1 : Number(t[0]);
        }
        return a;
    };

    // clean input data
    for (let i in constrains) {
        constrains[i][0] = clean(constrains[i][0]);
    }
    objective = clean(objective);

    // constrains + objective
    let rows = constrains.length + 1;
    // number of 'x' terms + slack + 'z'
    let cols = objective.length + constrains.length + 1 + 1;

    // create the matrix
    let m = new Array(rows).fill(0);
    for (let i in m) {
        m[i] = new Array(cols).fill(0);
    }

    // fill the matrix (constrains)
    for (let i in constrains) {
        for (let j in constrains[i][0]) {
            m[i][j] = constrains[i][0][j];
        }
        m[i][cols - 1] = constrains[i][1];
    }

    // fill the matrix (slacks)
    for (let i = 0; i < constrains.length; ++i) {
        m[i][objective.length + i] = 1;
    }

    // fill the matrix (z)
    for (let i in objective) {
        m[rows - 1][i] = objective[i] * -1;
    }
    m[rows - 1][cols - 2] = 1;

    return m;
}

function calc_mat(m, print) {

    const printtitle1 = s =>
          { print("* "  + s + "\n" + "=".repeat(s.length + 2) + "\n"); };
    const printtitle2 = s =>
          { print("** " + s + "\n" + "~".repeat(s.length + 3) + "\n"); };

    const mround = n => Math.round(n * 100) / 100;

    const format_mat = m => {

        // pad numbers with spaces
        const pad = (n, sz) => {
            if (sz < 3) {
                sz = 3;
            }
            let s = n + "";
            while (s.length < sz) {
                s = " " + s;
            }
            return s;
        };

        // find the widths of the table items
        let widths = new Array(m[0].length).fill(0);
        for (let i in m[0]) {
            let max_w = 0;
            for (let j in m) {
                let tmp = (mround(m[j][i]) + "").length;
                if (tmp > max_w) {
                    max_w = tmp;
                }
            }
            widths[i] = max_w + 1;
        }

        let slacks = m.length - 1;
        let x_terms = m[0].length - slacks - 2;
        let a = [];
        let s = "";
        let vars = [];
        for (let i = 1; i <= x_terms; ++i) {
            s += pad("x" + i, widths[i - 1]);
            vars.push("x" + i);
        }
        for (let i = 1; i <= slacks; ++i) {
            s += pad("s" + i, widths[x_terms + i - 1]);
            vars.push("s" + i);
        }
        s += pad("z", widths[widths.length - 2]);
        vars.push("z");
        a.push(s);

        for (let i in m) {
            s = "";
            for (let j in m[i]) {
                if (j == m[i].length - 1) {
                    s += " |";
                }
                s += pad(mround(m[i][j]), widths[j]);
            }
            a.push(s);
        }

        s = a.pop();
        a.push("-".repeat(s.length));
        a.push(s);

        s = "=> ";
        for (let v in vars) {
            let one_i = 0;
            let none_zero_cnt = 0;
            for (let i in m) {
                if (m[i][v] == 1) {
                    one_i = i;
                }
                if (m[i][v] != 0) {
                    ++none_zero_cnt;
                }
            }
            let val = none_zero_cnt > 1 ? 0 :
                mround(m[one_i][m[0].length - 1]);
            s += `${vars[v]}=${val} `;
        }
        a.push(s);
        a.push("");

        return a.join("\n");
    };

    printtitle1("Initial matrix");
    print(format_mat(m));

    for (let k = 0; k < 2; ++k) {
        // finding the pivot
        let min = m[m.length - 1][0];
        let min_i = 0;
        for (let i in m[0]) {
            i = Number(i);
            if (m[m.length - 1][i] < min) {
                min = m[m.length - 1][i];
                min_i = i;
            }
        }
        if (min >= 0) { // no -ve items
            break;
        }
        min = m[0][m[0].length - 1] / m[0][min_i];
        let min_j = 0;
        let tmp;
        for (let j = 0; j < m.length - 1; ++j) {
            tmp = m[j][m[0].length - 1] / m[j][min_i];
            if (tmp < min) {
                min = tmp;
                min_j = j;
            }
        }
        min_i = Number(min_i);
        min_j = Number(min_j);
        let pivot = m[min_j][min_i];

        printtitle1(`Found pivot ${mround(pivot)} at R${min_j + 1} and C${min_i + 1}`);

        // make the pivot 1
        printtitle2(`1/${mround(pivot)} R${min_j + 1} => R${min_j + 1}`);
        for (let i in m[0]) {
            m[min_j][i] /= pivot;
        }
        print(format_mat(m));

        // zeros above and below pivot
        for (let j in m) {
            j = Number(j);
            if (j == min_j) {
                continue;
            }
            tmp = m[j][min_i];
            printtitle2(`${-mround(tmp)} * R${min_j + 1} + R${j + 1} => R${j + 1}`);
            for (let i in m[0]) {
                m[j][i] = -tmp * m[min_j][i] + m[j][i];
            }
            print(format_mat(m));
        }

    }

}

function calc(objective, constrains, print) {
    calc_mat(build_mat(objective, constrains), print);
}

function test0() {
    const print = s => console.log(s);
    let objective = '20x1+40x2';
    let constrains = [
        [ '4x1+3x2', 168 ],
        [ '2x1+3x2', 108 ],
        [ 'x1+3x2',  96  ]
    ];
    calc(objective, constrains, print);
}

function test1() {
    const print = s => console.log(s);
    calc_mat([
        [ 1, 4, 3, 1, 0, 0, 56 ],
        [ 2, 2, 1, 0, 1, 0, 18 ],
        [ -1, -4, -2, 0, 0, 1, 0]
    ], print);
}

function test2() {
    const print = s => console.log(s);
    calc_mat([
        [ 1, 2, 4, 1, 0, 0, 8 ],
        [ 4, 4, 1, 0, 1, 0, 10 ],
        [ -5, -20, 1, 0, 0, 1, 0]
    ], print);
}

function test3() {
    const print = s => console.log(s);
    let objective = '10x1+3x2+x3';
    let constrains = [
        [ 'x1+5x2+5x3', 113 ],
        [ 'x1+2x2+9x3', 236 ]
    ];
    calc(objective, constrains, print);
}

function test4() {
    const print = s => console.log(s);
    let objective = '2x1+3x2';
    let constrains = [
        [ '-2x1+x2', 14 ],
        [ '-x1+x2', 35 ],
        [ 'x2', 42 ]
    ];
    calc(objective, constrains, print);
}

function test5() {
    const print = s => console.log(s);
    let objective = '13x1+13x2';
    let constrains = [
        [ '2x1+x2', 2 ],
        [ 'x1+2x2', 26 ]
    ];
    calc(objective, constrains, print);
}

//test5();
